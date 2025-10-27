import mongoose from "mongoose";
const advisoryLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref:"User" },
  input: { N:Number, P:Number, K:Number, ph:Number, temperature:Number, rainfall:Number },
  output: { recommended_crop:String, confidence:Number, fertilizer:String }
},{timestamps:true});
export default mongoose.model("AdvisoryLog", advisoryLogSchema);
