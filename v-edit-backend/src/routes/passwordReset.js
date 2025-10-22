import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
} from "../utils/email.js";

const router = express.Router();

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Hash token before saving to database
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Save hashed token and expiration to user
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Send email with unhashed token
      try {
        console.log(
          `📧 Attempting to send password reset email to: ${user.email}`,
        );
        console.log(
          `🔑 Reset token generated: ${resetToken.substring(0, 10)}...`,
        );
        console.log(
          `🔗 Reset link will be: ${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`,
        );

        await sendPasswordResetEmail(user.email, resetToken);
        console.log(
          `✅ Password reset email sent successfully to: ${user.email}`,
        );
      } catch (emailError) {
        console.error("❌ Error sending reset email:", emailError);
        console.error("❌ Error details:", emailError.message);
        // Clear the reset token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(500).json({
          message: "Error sending reset email. Please try again later.",
        });
      }
    } else {
      console.log(
        `⚠️ Password reset requested for non-existent email: ${email}`,
      );
    }

    console.log(`📬 Response sent for password reset request: ${email}`);
    // Always return success message
    return res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    console.error("❌ Error stack:", error.stack);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordResetConfirmation(user.email);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the request if confirmation email fails
    }

    console.log(`✅ Password reset successful for: ${user.email}`);

    return res.status(200).json({
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

// Verify reset token (optional - for frontend to check if token is valid)
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(400)
        .json({ valid: false, message: "Token is required" });
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Token is valid",
      email: user.email, // Return email for display purposes
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return res.status(500).json({ valid: false, message: "Server error" });
  }
});

export default router;
