import nodemailer from "nodemailer";

/**
 * Isolated server-side email service for MHADA Towers Utsav Mandal.
 * Supports production SMTP and safe development simulation.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        console.log(`[EmailService] Configured SMTP transporter with host: ${host}`);
      } catch (err) {
        console.warn(`[EmailService] Failed to initialize SMTP transporter: ${err.message}`);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
      console.log(
        "[EmailService] No active SMTP credentials found in environment. Email service running in simulation mode for local testing."
      );
    }
  }

  async sendEmail({ to, subject, text, html }) {
    if (!to || !to.trim()) {
      throw new Error("Recipient email address is required.");
    }
    if (!subject || !subject.trim()) {
      throw new Error("Email subject is required.");
    }
    if (!text || !text.trim()) {
      throw new Error("Email body content is required.");
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      `"MHADA Towers Utsav Mandal" <${process.env.SMTP_USER || "mhadatowersutsavmandal@gmail.com"}>`;

    // Re-check transporter if env changed
    if (!this.transporter && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.initTransporter();
    }

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: to.trim(),
          subject: subject.trim(),
          text: text.trim(),
          html: html || text.trim().replace(/\n/g, "<br/>"),
        });
        console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return {
          success: true,
          messageId: info.messageId,
          simulated: false,
        };
      } catch (error) {
        console.error(`[EmailService] Failed to dispatch email via SMTP to ${to}:`, error.message);
        throw new Error(`SMTP dispatch error: ${error.message}`);
      }
    }

    // Development / Local fallback mode (when no SMTP credentials exist in env)
    console.log("==========================================================");
    console.log("[EmailService - SIMULATED EMAIL DISPATCH]");
    console.log(`From:    ${fromAddress}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Body:");
    console.log(text);
    console.log("==========================================================");

    return {
      success: true,
      simulated: true,
      message: "Email sent (Simulated in local development mode).",
    };
  }
}

const emailService = new EmailService();
export default emailService;
