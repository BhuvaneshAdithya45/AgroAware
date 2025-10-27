import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

export default router;
