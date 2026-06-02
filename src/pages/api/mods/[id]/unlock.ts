import type { NextApiRequest, NextApiResponse } from "next";
import { MODS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });
  if (!req.cookies.auth_user) return res.status(401).json({ detail: "Login required" });

  const mod = MODS.find(m => m.id === parseInt(String(req.query.id)));
  if (!mod) return res.status(404).json({ detail: "Mod not found" });
  if (!mod.is_paid) return res.status(400).json({ detail: "This mod is free, no code needed" });

  const { code } = req.body;
  if (!code || code !== mod.unlock_code) {
    return res.status(400).json({ detail: "Invalid unlock code" });
  }

  // Set cookie to remember unlock
  res.setHeader("Set-Cookie", `unlocked_${mod.id}=true; Path=/; Max-Age=31536000; SameSite=Lax`);
  res.status(200).json({ success: true });
}
