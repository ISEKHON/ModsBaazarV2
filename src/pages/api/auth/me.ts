import type { NextApiRequest, NextApiResponse } from "next";
import { USERS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.cookies.auth_user;
  if (!userId) return res.status(401).json({ detail: "Not authenticated" });

  const user = USERS.find(u => u.id === parseInt(userId));
  if (!user) return res.status(401).json({ detail: "Not authenticated" });

  res.status(200).json(user);
}
