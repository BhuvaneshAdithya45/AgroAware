import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type:String, required:true },
  email: { type:String, unique:true },
  passwordHash: { type:String, required:true },
  role: { type:String, enum:["farmer","ngo","admin"], default:"farmer" },
  language: { type:String, default:"en" }
},{timestamps:true});
export default mongoose.model("User", userSchema);
