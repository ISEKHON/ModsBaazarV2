import type { NextApiRequest, NextApiResponse } from "next";
import { USERS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = USERS.find(u => u.id === parseInt(String(req.query.id)));
  if (!user) return res.status(404).json({ detail: "User not found" });

  if (req.method === "GET") return res.status(200).json(user);

  if (req.method === "PUT") {
    // Mock role/status update
    const updated = { ...user, ...req.body };
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ detail: "Method not allowed" });
}
