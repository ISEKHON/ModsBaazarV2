import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });

  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ detail: "All fields required" });
  if (password.length < 6) return res.status(400).json({ detail: "Password must be at least 6 characters" });

  const user = { id: Date.now(), name, email, role: "user" as const, created_at: new Date().toISOString() };
  res.setHeader("Set-Cookie", `auth_user=${user.id}; Path=/; Max-Age=86400; SameSite=Lax`);
  res.status(200).json(user);
}
