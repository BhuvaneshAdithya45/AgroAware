import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTP, verifyOTP } from "../utils/otp.js";

const router = express.Router();

router.post("/register", async (req,res)=>{
  const { name, email, password, role, language } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({error:"Email already registered"});
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role, language });
  res.json({ ok:true, id:user._id });
});

router.post("/login", async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({error:"User not found"});
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({error:"Invalid credentials"});
  const token = jwt.sign({ uid:user._id, role:user.role }, process.env.JWT_SECRET, { expiresIn:"7d" });
  res.json({ token, user:{ id:user._id, name:user.name, role:user.role, language:user.language } });
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

    res.json({ success: true, message: result.message });
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
