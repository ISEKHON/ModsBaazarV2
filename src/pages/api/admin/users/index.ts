import type { NextApiRequest, NextApiResponse } from "next";
import { USERS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(USERS);
}
