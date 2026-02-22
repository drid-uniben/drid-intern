import nodemailer from "nodemailer";
import { env } from "../config/env";

interface InvitationEmailInput {
  to: string;
  inviteLink: string;
  category: string;
}

class EmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  async sendInvitation(input: InvitationEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: `"DRID UNIBEN" <${process.env.EMAIL_FROM}>`,
      to: input.to,
      subject: "DRID Internship Challenge Invitation",
      html: `
        <p>You have been invited to submit the DRID internship ${input.category} challenge.</p>
        <p>Use this secure link to continue: <a href="${input.inviteLink}">${input.inviteLink}</a></p>
      `,
    });
  }
}

export const emailService = new EmailService();
