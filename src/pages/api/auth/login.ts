import type { NextApiRequest, NextApiResponse } from "next";
import { USERS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ detail: "Email and password required" });

  // Mock auth: accept any known email with any password, or admin@fsmodshub.com for admin
  let user = USERS.find(u => u.email === email);
  if (!user) {
    // Create a virtual user for demo
    user = { id: 2, name: email.split("@")[0], email, role: "user" as const, status: "active" as const, downloads: 0, unlocks: 0, created_at: new Date().toISOString() };
  }

  res.setHeader("Set-Cookie", `auth_user=${user.id}; Path=/; Max-Age=86400; SameSite=Lax`);
  res.status(200).json(user);
}
