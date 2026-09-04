"use server";

import { getServerActionClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const relationMap: Record<string, "mother" | "father" | "guardian"> = {
  Mamá: "mother",
  Papá: "father",
  "Tutor/a": "guardian",
};

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function sendInvitation(data: {
  childId: string;
  parentName: string;
  parentEmail: string;
  relationship: string;
}) {
  const supabase = await getServerActionClient();

  try {
    // 1. Validate child exists and belongs to current user's daycare
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("id, room_id, rooms!inner(daycare_id)")
      .eq("id", data.childId)
      .single();

    if (childError || !child) {
      return { error: "El niño no existe" };
    }

    // 2. Validate relationship
    const dbRelation = relationMap[data.relationship];
    if (!dbRelation) {
      return { error: "Parentesco no válido" };
    }

    // 3. Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("invitations")
        .select("id")
        .eq("code", code)
        .single();

      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    if (attempts >= 5) {
      return { error: "No se pudo generar un código único. Intente nuevamente." };
    }

    // 4. Insert into invitations
    const { error: insertError } = await supabase.from("invitations").insert({
      child_id: data.childId,
      parent_email: data.parentEmail,
      parent_name: data.parentName,
      relationship: dbRelation,
      code,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      console.error("Invitation insert error:", insertError);
      return { error: "No se pudo crear la invitación" };
    }

    // 5. Send email via Resend
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const activationUrl = `${appUrl}/activate?code=${code}`;

    try {
      await sendInvitationEmail(data.parentEmail, code, activationUrl, `${data.parentName} (${data.parentEmail})`);
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the whole operation if email fails — invitation is stored
    }

    revalidatePath(`/kids/${data.childId}`);
    return { success: true };
  } catch (err) {
    console.error("sendInvitation error:", err);
    return { error: "Error inesperado al enviar la invitación" };
  }
}

export async function verifyInvitationCode(code: string) {
  const supabase = await getServerActionClient();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(
      `
      id,
      code,
      parent_email,
      parent_name,
      relationship,
      expires_at,
      status,
      child_id,
      children!inner(full_name)
    `
    )
    .eq("code", code)
    .eq("status", "pending")
    .single();

  if (error || !invitation) {
    return { error: "Código de invitación inválido o expirado" };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "El código de invitación ha expirado" };
  }

  return {
    success: true,
    invitation: {
      id: invitation.id,
      code: invitation.code,
      parentEmail: invitation.parent_email,
      parentName: invitation.parent_name,
      relationship: invitation.relationship,
      childName: invitation.children.full_name,
      childId: invitation.child_id,
    },
  };
}

export async function activateFromInvitation(data: {
  code: string;
  email: string;
  password: string;
}) {
  const supabase = await getServerActionClient();

  try {
    // 1. Verify the invitation code is valid and not expired
    const { data: invitation, error: verifyError } = await supabase
      .from("invitations")
      .select("*")
      .eq("code", data.code)
      .eq("status", "pending")
      .single();

    if (verifyError || !invitation) {
      return { error: "Código de invitación inválido o expirado" };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { error: "El código de invitación ha expirado" };
    }

    // 2. Create user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: invitation.parent_name,
        },
      },
    });

    if (signUpError || !authData.user) {
      console.error("Auth signup error:", signUpError);
      return { error: "No se pudo crear la cuenta. Verifica el email y contraseña." };
    }

    // 3. Insert into users table
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      full_name: invitation.parent_name,
      role: "parent",
      status: "pending",
      daycare_id: (
        await supabase
          .from("children")
          .select("room_id, rooms!inner(daycare_id)")
          .eq("id", invitation.child_id)
          .single()
      ).data!.rooms.daycare_id,
    });

    if (userError) {
      console.error("User insert error:", userError);
      return { error: "No se pudo crear el perfil de usuario" };
    }

    // 4. Insert into parent_children
    const { error: pcError } = await supabase.from("parent_children").insert({
      parent_id: authData.user.id,
      child_id: invitation.child_id,
      relationship: invitation.relationship,
    });

    if (pcError) {
      console.error("parent_children insert error:", pcError);
      return { error: "No se pudo vincular al niño" };
    }

    // 5. Mark invitation as used
    const { error: invError } = await supabase
      .from("invitations")
      .update({ status: "accepted", used_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (invError) {
      console.error("Invitation update error:", invError);
    }

    return { success: true };
  } catch (err) {
    console.error("activateFromInvitation error:", err);
    return { error: "Error inesperado al activar la cuenta" };
  }
}
