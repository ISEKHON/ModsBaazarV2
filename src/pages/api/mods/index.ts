import type { NextApiRequest, NextApiResponse } from "next";
import { MODS } from "@/lib/mock-data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let result = [...MODS];
  const { q, game, category, is_paid, sort, limit, tag } = req.query;

  if (q) {
    const search = String(q).toLowerCase();
    result = result.filter(m =>
      m.title.toLowerCase().includes(search) ||
      m.author.toLowerCase().includes(search) ||
      m.tags.some(t => t.toLowerCase().includes(search))
    );
  }
  if (game) result = result.filter(m => m.game === String(game));
  if (category) result = result.filter(m => m.category === String(category));
  if (is_paid === "true") result = result.filter(m => m.is_paid);
  if (is_paid === "false") result = result.filter(m => !m.is_paid);
  if (tag) result = result.filter(m => m.tags.includes(String(tag)));

  if (sort === "popular") result.sort((a, b) => b.downloads - a.downloads);
  else if (sort === "views") result.sort((a, b) => b.views - a.views);
  else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (limit) result = result.slice(0, parseInt(String(limit)));

  res.status(200).json(result);
}
