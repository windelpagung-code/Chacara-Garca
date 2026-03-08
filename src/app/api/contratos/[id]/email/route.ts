import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { to, html, clientName, contractId } = await request.json();

  if (!to || !html) {
    return NextResponse.json({ error: "Destinatário e conteúdo são obrigatórios" }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT ?? "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM ?? smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return NextResponse.json(
      { error: "Configurações de e-mail não definidas. Configure SMTP_HOST, SMTP_USER e SMTP_PASS no .env" },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"Chácara Garça" <${smtpFrom}>`,
    to,
    subject: `Contrato #${contractId} - ${clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        ${html}
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
