import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", "auth_user=; Path=/; Max-Age=0; SameSite=Lax");
  res.status(200).json({ success: true });
}
