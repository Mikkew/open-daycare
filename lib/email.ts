import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(
  to: string,
  code: string,
  activationUrl: string,
) {
  const { data, error } = await resend.emails.send({
    from: "Open DayCare <onboarding@resend.dev>",
    to,
    subject: "Invitación a Open DayCare",
    html: `
      <h1>¡Bienvenido a Open DayCare!</h1>
      <p>Tu código de invitación es:</p>
      <h2 style="letter-spacing: 4px; font-size: 24px;">${code}</h2>
      <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
      <a href="${activationUrl}">Activar mi cuenta</a>
      <p>O visita: ${activationUrl}</p>
      <p>Este código expira en 7 días.</p>
    `,
  });

  if (error) {
    console.error("Error sending invitation email:", error);
    throw new Error("No se pudo enviar el email de invitación");
  }

  return data;
}
