import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Forever-free email solution using Nodemailer + Ethereal
//
// - By default (no SMTP env vars): uses Ethereal (completely free, no API key)
//   → Creates a real temporary inbox. You get a preview URL in the console.
// - For real emails: set SMTP_* env vars (works with Brevo, Gmail, Mailgun, etc.)
// ---------------------------------------------------------------------------

let transporter: nodemailer.Transporter | null = null;

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] as string));
}

async function getTransporter() {
  if (transporter) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    // Real SMTP (Brevo, Gmail, etc.)
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('[email] Using real SMTP transport');
  } else {
    // === FOREVER FREE: Ethereal (no key required, perfect for dev & testing) ===
    console.log('[email] No SMTP credentials found — using Ethereal (free testing inbox)');

    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Store the test account info for logging
    (transporter as any).__etherealAccount = testAccount;
  }

  return transporter;
}

export async function sendPasswordResetEmail(
  to: string,
  otp: string
): Promise<{ ok: boolean; error?: string; previewUrl?: string }> {
  const subject = 'Your Webmers password reset code';

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0a0a0a; color: #fff;">
      <div style="margin-bottom: 24px;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <div style="width: 28px; height: 28px; background: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #0a0a0a; font-weight: 700; font-size: 18px;">W</span>
          </div>
          <span style="font-size: 22px; font-weight: 600; letter-spacing: -0.5px;">Webmers</span>
        </div>
      </div>

      <h1 style="font-size: 24px; margin: 0 0 12px; font-weight: 600;">Reset your password</h1>
      <p style="color: #888; margin: 0 0 24px; line-height: 1.5;">
        We received a request to reset the password for <strong>${escapeHtml(to)}</strong>.
      </p>

      <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <div style="color: #888; font-size: 13px; margin-bottom: 8px; letter-spacing: 1px;">YOUR ONE-TIME CODE</div>
        <div style="font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${otp}</div>
      </div>

      <p style="color: #888; font-size: 14px; margin: 0 0 8px;">
        This code will expire in <strong>10 minutes</strong>.
      </p>
      <p style="color: #666; font-size: 13px; margin: 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || 'Webmers <no-reply@webmers.io>',
      to,
      subject,
      html,
    });

    // Ethereal special handling (forever free)
    const etherealAccount = (transport as any).__etherealAccount;
    let previewUrl: string | undefined;

    if (etherealAccount && nodemailer.getTestMessageUrl(info)) {
      previewUrl = nodemailer.getTestMessageUrl(info) as string;
      console.log('\n[DEV] ═══════════════════════════════════════════════');
      console.log(`[DEV] Password reset OTP for ${to}: ${otp}`);
      console.log(`[DEV] View the email here → ${previewUrl}`);
      console.log('[DEV] ═══════════════════════════════════════════════\n');
    } else if (!etherealAccount) {
      console.log(`[email] Password reset email sent to ${to} (messageId: ${info.messageId})`);
    }

    return { ok: true, previewUrl };
  } catch (err: any) {
    console.error('Email send error:', err.message || err);
    return { ok: false, error: 'Failed to send reset email.' };
  }
}
