import type { NextApiRequest, NextApiResponse } from "next";
import { MODS } from "@/lib/mock-data";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(MODS.filter(m => m.featured));
}
