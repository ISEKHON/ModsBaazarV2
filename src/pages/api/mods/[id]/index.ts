import type { NextApiRequest, NextApiResponse } from "next";
import { MODS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mod = MODS.find(m => m.id === parseInt(String(req.query.id)));
  if (!mod) return res.status(404).json({ detail: "Mod not found" });

  // Check if user has unlocked this (from cookie)
  const unlocked = req.cookies[`unlocked_${mod.id}`] === "true";
  const { unlock_code, ...safemod } = mod;
  res.status(200).json({ ...safemod, unlocked });
}
