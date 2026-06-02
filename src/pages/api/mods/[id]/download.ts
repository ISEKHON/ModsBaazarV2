import type { NextApiRequest, NextApiResponse } from "next";
import { MODS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });
  if (!req.cookies.auth_user) return res.status(401).json({ detail: "Login required" });

  const mod = MODS.find(m => m.id === parseInt(String(req.query.id)));
  if (!mod) return res.status(404).json({ detail: "Mod not found" });

  if (mod.is_paid && req.cookies[`unlocked_${mod.id}`] !== "true") {
    return res.status(403).json({ detail: "Mod not unlocked. Enter unlock code first." });
  }

  res.status(200).json({ filename: `${mod.title.replace(/\s+/g, "_")}_v${mod.version}.zip`, download_url: "#" });
}
