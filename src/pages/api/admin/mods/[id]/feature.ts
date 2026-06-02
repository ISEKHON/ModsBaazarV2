import type { NextApiRequest, NextApiResponse } from "next";
import { MODS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });
  const mod = MODS.find(m => m.id === parseInt(String(req.query.id)));
  if (!mod) return res.status(404).json({ detail: "Mod not found" });
  res.status(200).json({ ...mod, featured: !mod.featured });
}
