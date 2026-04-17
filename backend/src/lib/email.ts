import nodemailer from 'nodemailer';

/**
 * Standalone email sender - works independently of any platform.
 *
 * To configure outside Vibecode, set these environment variables:
 *   SMTP_HOST     - e.g. smtp.gmail.com
 *   SMTP_PORT     - e.g. 587
 *   SMTP_USER     - your email address
 *   SMTP_PASS     - your email password or app password
 *   SMTP_FROM     - optional sender name/email (defaults to SMTP_USER)
 *
 * For Gmail: create an App Password at https://myaccount.google.com/apppasswords
 */

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendNotificationEmail(to: string, subject: string, body: string): Promise<void> {
  const t = getTransporter();

  if (t) {
    // Use SMTP (Nodemailer) - fully independent, full body supported
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    await t.sendMail({ from, to, subject, text: body });
    console.log(`[Email] Sent via SMTP to ${to}: ${subject}`);
    return;
  }

  // Fallback: Vibecode SDK - only has welcome/OTP templates with limited fields.
  // We send two emails: one with the subject/event type, one with the key detail (phone/amount).
  try {
    const { createVibecodeSDK } = await import('@vibecodeapp/backend-sdk');
    const sdk = createVibecodeSDK();

    // First email: event notification (subject as name, truncated to 50 chars)
    await sdk.email.sendWelcome({
      to,
      name: subject.slice(0, 50),
      appName: 'Glossy Quotes',
      fromName: 'Glossy Notifications',
    });

    // Second email: key detail line (body truncated to 50 chars)
    const detail = body.slice(0, 50);
    await sdk.email.sendWelcome({
      to,
      name: detail,
      appName: 'Glossy Quotes - Details',
      fromName: 'Glossy Notifications',
    });

    console.log(`[Email] Sent 2x Vibecode SDK emails to ${to}: ${subject}`);
  } catch (err) {
    console.warn('[Email] Vibecode SDK email failed:', err);
    console.warn('[Email] To enable full emails, set SMTP_HOST, SMTP_USER, SMTP_PASS env vars (Gmail App Password recommended).');
  }
}
