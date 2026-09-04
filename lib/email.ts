import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(
  to: string,
  code: string,
  activationUrl: string,
  invitationFor?: string,
) {
  const testEmail = process.env.RESEND_TEST_EMAIL;
  const actualRecipient = testEmail || to;

  const { data, error } = await resend.emails.send({
    from: "Open DayCare <onboarding@resend.dev>",
    to: [actualRecipient],
    subject: `Invitación a Open DayCare${invitationFor ? ` - ${invitationFor}` : ""}`,
    html: `
      <h1>¡Bienvenido a Open DayCare!</h1>
      ${invitationFor ? `<p><strong>Esta invitación es para:</strong> ${invitationFor}</p>` : ""}
      <p>Tu código de invitación es:</p>
      <h2 style="letter-spacing: 4px; font-size: 24px;">${code}</h2>
      <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
      <a href="${activationUrl}">Activar mi cuenta</a>
      <p>O visita: ${activationUrl}</p>
      <p>Este código expira en 7 días.</p>
      ${testEmail ? `<p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 12px;">⚠️ Sandbox mode: enviado a ${testEmail} (destinatario real: ${to})</p>` : ""}
    `,
  });

  if (error) {
    console.error("Error sending invitation email:", error);
    throw new Error("No se pudo enviar el email de invitación");
  }

  return data;
}
