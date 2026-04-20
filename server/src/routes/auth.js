import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTP, verifyOTP } from "../utils/otp.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, language } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    // Validate name length
    if (name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role, language });
    res.json({ ok: true, id: user._id });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ uid: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, language: user.language } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// 📱 OTP-based phone login
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const result = await sendOTP(phone);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ success: true, message: result.message, otp: result.otp });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const result = await verifyOTP(phone, otp);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Find or create user by phone
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user with phone
      user = await User.create({
        name: `Farmer ${phone}`,
        phone,
        email: `phone_${phone}@agroaware.local`,
        passwordHash: "",
        role: "farmer",
        language: "en",
      });
    }

    // Create JWT token
    const token = jwt.sign({ uid: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        language: user.language
      }
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

export default router;
