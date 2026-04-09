import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM ?? 'noreply@fitlog.com';
const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

/** Send email verification link */
export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Verify your LogFit account',
      html: `
        <h1>Welcome to LogFit!</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: message };
  }
}

/** Send password reset link */
export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Reset your LogFit password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to set a new password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 24 hours. If you didn't request this, ignore this email.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: message };
  }
}
