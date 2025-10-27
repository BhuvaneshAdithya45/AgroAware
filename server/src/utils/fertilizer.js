// server/src/utils/fertilizer.js
export function recommendFertilizer({ N, P, K, ph }, crop = "Crop") {
  const tips = [];
  if (ph < 6.5) tips.push("Apply lime to adjust pH");
  if (N < 50) tips.push("Increase Nitrogen (Urea)");
  if (P < 40) tips.push("Add Phosphorus (DAP)");
  if (K < 40) tips.push("Add Potassium (MOP)");
  if (!tips.length) tips.push("Balanced NPK application as per recommended package");
  return `${crop}: ${tips.join(". ")}.`;
}