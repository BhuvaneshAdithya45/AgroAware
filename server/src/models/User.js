import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type:String, required:true },
  email: { type:String, unique:true, sparse:true },
  phone: { type:String, unique:true, sparse:true },
  passwordHash: { type:String },
  role: { type:String, enum:["farmer","ngo","admin"], default:"farmer" },
  language: { type:String, default:"en" }
},{timestamps:true});
export default mongoose.model("User", userSchema);
