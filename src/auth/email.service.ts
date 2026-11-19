import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly fromEmail = process.env.EMAIL_USER;
  private readonly fromName = process.env.EMAIL_NAME || 'Community App Support';

  private readonly transporter = nodemailer.createTransport(
    process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
          secure: ['true', '1'].includes((process.env.SMTP_SECURE || '').toLowerCase()),
          auth: {
            user: this.fromEmail,
            pass: process.env.EMAIL_PASS,
          },
        }
      : {
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: this.fromEmail,
            pass: process.env.EMAIL_PASS,
          },
        },
  );

  private async send(message: nodemailer.SendMailOptions): Promise<void> {
    if (!this.fromEmail || !process.env.EMAIL_PASS) {
      throw new Error(
        'Email is not configured. Set EMAIL_USER and EMAIL_PASS (use a Gmail App Password, not your regular Gmail password).',
      );
    }

    try {
      await this.transporter.sendMail(message);
    } catch (error: unknown) {
      const smtpError = error as { code?: string; responseCode?: number; response?: string };
      if (smtpError.code === 'EAUTH' || (smtpError.responseCode && smtpError.responseCode >= 535)) {
        throw new Error(
          'SMTP authentication failed: Gmail rejected EMAIL_USER/EMAIL_PASS. ' +
            'Make sure 2-Step Verification is ON and use a 16-character Gmail App Password ' +
            '(not your regular Gmail password). See https://support.google.com/mail/?p=BadCredentials',
        );
      }
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    // Use the public (ngrok) base URL when available so the reset link opens
    // correctly from any device, otherwise fall back to localhost. You can also
    // pin a custom frontend URL with RESET_LINK_BASE if one is deployed.
    const baseUrl =
      process.env.RESET_LINK_BASE ||
      (process.env.NGROK_DOMAIN ? `https://${process.env.NGROK_DOMAIN}` : 'http://localhost:3000');

    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await this.send({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link below to reset your password: ${resetLink}`,
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
  }

  async sendTemporaryPasswordEmail(email: string, temporaryPassword: string) {
    const baseUrl =
      process.env.RESET_LINK_BASE ||
      (process.env.NGROK_DOMAIN ? `https://${process.env.NGROK_DOMAIN}` : 'http://localhost:3000');

    await this.send({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: 'Your New Temporary Password',
      text:
        `A temporary password has just been generated for your account.\n\n` +
        `Temporary password: ${temporaryPassword}\n\n` +
        `Sign in at ${baseUrl} and change the password as soon as possible.`,
      html:
        `<p>A temporary password has just been generated for your account.</p>` +
        `<p><strong>Temporary password:</strong> <code>${temporaryPassword}</code></p>` +
        `<p>Sign in at <a href="${baseUrl}">${baseUrl}</a> and change the password as soon as possible.</p>`,
    });
  }

  /**
   * Generic email sender — mirrors the legacy "SendMail" REST endpoint which
   * accepted a subject / body / to_email triplet. Throws on failure so the
   * GraphQL layer can surface a proper error.
   */
  async sendMail(toEmail: string, subject: string, body: string): Promise<void> {
    await this.send({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: toEmail,
      subject,
      text: body,
      html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
    });
  }
}
