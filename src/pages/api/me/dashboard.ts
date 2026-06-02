import type { NextApiRequest, NextApiResponse } from "next";
import { USERS, MODS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.cookies.auth_user;
  if (!userId) return res.status(401).json({ detail: "Login required" });

  const user = USERS.find(u => u.id === parseInt(userId)) || {
    id: parseInt(userId), name: "Demo User", email: "demo@example.com", role: "user" as const, created_at: new Date().toISOString()
  };

  // Check which mods are unlocked via cookies
  const unlocked_mods = MODS.filter(m => m.is_paid && req.cookies[`unlocked_${m.id}`] === "true");

  const downloads = [
    { mod_id: 2, mod_title: "Midwest Harvest Map", downloaded_at: "2026-05-20T10:00:00Z" },
    { mod_id: 7, mod_title: "Fendt 1050 Vario", downloaded_at: "2026-05-18T14:30:00Z" },
    { mod_id: 3, mod_title: "Case IH Axial-Flow 9250 Harvester", downloaded_at: "2026-05-15T09:00:00Z" },
  ];

  res.status(200).json({ user, unlocked_mods, downloads });
}
