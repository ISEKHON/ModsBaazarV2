import type { NextApiRequest, NextApiResponse } from "next";
import { MODS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Mock create
    const newMod = { ...req.body, id: Date.now(), downloads: 0, views: 0, shares: 0, featured: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    return res.status(201).json(newMod);
  }
  res.status(200).json(MODS);
}
