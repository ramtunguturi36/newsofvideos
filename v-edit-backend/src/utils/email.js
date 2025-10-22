import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP service)
  // For production, use your actual email service (Gmail, SendGrid, etc.)

  // Check if email credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use actual email service when credentials are available
    console.log("📧 EMAIL MODE: Real emails will be sent via SMTP");
    console.log(`📬 SMTP Host: ${process.env.EMAIL_HOST || "smtp.gmail.com"}`);
    console.log(`📮 Email From: ${process.env.EMAIL_USER}`);

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add timeout and connection options
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  } else {
    // Development: Log to console instead of sending real emails
    console.log("🔧 EMAIL MODE: Development (emails will be logged, not sent)");
    console.log(
      "⚠️  To send real emails, set EMAIL_USER and EMAIL_PASS in .env",
    );
    return {
      sendMail: async (mailOptions) => {
        console.log("\n========================================");
        console.log("📧 EMAIL WOULD BE SENT (Development Mode)");
        console.log("========================================");
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        console.log("From:", mailOptions.from);
        console.log("\n📝 Plain Text Content:");
        console.log(mailOptions.text);
        console.log("========================================\n");
        return { messageId: "dev-mode-" + Date.now() };
      },
    };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  console.log(`\n🚀 Starting password reset email process...`);
  console.log(`📧 Recipient: ${email}`);
  console.log(`🔑 Token (first 10 chars): ${resetToken.substring(0, 10)}...`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

  const transporter = createTransporter();

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  console.log(`🔗 Reset URL: ${resetUrl}`);

  const mailOptions = {
    from: `"V-Edit Support" <${process.env.EMAIL_USER || "noreply@v-edit.com"}>`,
    to: email,
    subject: "Password Reset Request - V-Edit",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            border-radius: 10px;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #667eea;
            font-size: 32px;
            margin: 0;
          }
          .button {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: white;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="logo">
              <h1>🎬 V-Edit</h1>
            </div>

            <h2>Password Reset Request</h2>

            <p>Hello,</p>

            <p>We received a request to reset your password for your V-Edit account. If you didn't make this request, you can safely ignore this email.</p>

            <p>To reset your password, click the button below:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for security reasons.
            </div>

            <p>If you have any questions or concerns, please contact our support team.</p>

            <p>Best regards,<br>
            <strong>The V-Edit Team</strong></p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} V-Edit. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - V-Edit

      Hello,

      We received a request to reset your password for your V-Edit account.

      To reset your password, click the link below or copy and paste it into your browser:
      ${resetUrl}

      This link will expire in 1 hour for security reasons.

      If you didn't request this password reset, you can safely ignore this email.

      Best regards,
      The V-Edit Team
    `,
  };

  try {
    console.log("📤 Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully!");
    console.log("📬 Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error code:", error.code);
    throw new Error("Failed to send password reset email");
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"V-Edit Support" <${process.env.EMAIL_USER || "noreply@v-edit.com"}>`,
    to: email,
    subject: "Password Successfully Reset - V-Edit",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px;
            border-radius: 10px;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #10b981;
            font-size: 32px;
            margin: 0;
          }
          .success-icon {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="logo">
              <h1>🎬 V-Edit</h1>
            </div>

            <div class="success-icon">✅</div>

            <h2 style="text-align: center; color: #10b981;">Password Reset Successful</h2>

            <p>Hello,</p>

            <p>Your password has been successfully reset. You can now log in to your V-Edit account using your new password.</p>

            <p>If you didn't make this change, please contact our support team immediately.</p>

            <p>Best regards,<br>
            <strong>The V-Edit Team</strong></p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} V-Edit. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Successful - V-Edit

      Hello,

      Your password has been successfully reset. You can now log in to your V-Edit account using your new password.

      If you didn't make this change, please contact our support team immediately.

      Best regards,
      The V-Edit Team
    `,
  };

  try {
    console.log("📤 Sending confirmation email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset confirmation email sent successfully!");
    console.log("📬 Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);
    console.error("❌ Error message:", error.message);
    // Don't throw error here as password was already reset
    return { success: false, error: error.message };
  }
};
