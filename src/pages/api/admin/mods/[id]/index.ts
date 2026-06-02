import type { NextApiRequest, NextApiResponse } from "next";
import { MODS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mod = MODS.find(m => m.id === parseInt(String(req.query.id)));
  if (!mod) return res.status(404).json({ detail: "Mod not found" });

  if (req.method === "GET") return res.status(200).json(mod);
  if (req.method === "PUT") return res.status(200).json({ ...mod, ...req.body });
  if (req.method === "DELETE") return res.status(200).json({ success: true });

  res.status(405).json({ detail: "Method not allowed" });
}
