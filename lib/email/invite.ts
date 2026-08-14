import { getResendClient } from "@/lib/email/client";
import type { WorkspaceRole } from "@/lib/supabase/types";

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  admin: "Administrador",
  member: "Membro",
};

export async function sendWorkspaceInviteEmail(params: {
  to: string;
  workspaceName: string;
  role: WorkspaceRole;
  inviteUrl: string;
  inviterEmail: string;
}): Promise<{ success: boolean }> {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    console.error("RESEND_FROM_EMAIL não configurada.");
    return { success: false };
  }

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Convite para o workspace ${params.workspaceName} no VibeFlow CRM`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
          <h2 style="margin-bottom: 8px;">Você foi convidado para o ${params.workspaceName}</h2>
          <p>
            ${params.inviterEmail || "Um administrador"} convidou você para colaborar no workspace
            <strong>${params.workspaceName}</strong> como <strong>${ROLE_LABELS[params.role]}</strong>
            no VibeFlow CRM.
          </p>
          <p style="margin: 24px 0;">
            <a
              href="${params.inviteUrl}"
              style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;"
            >
              Aceitar convite
            </a>
          </p>
          <p style="color:#666;font-size:12px;">
            Este convite expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Erro ao enviar e-mail de convite:", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("Erro ao enviar e-mail de convite:", err);
    return { success: false };
  }
}
