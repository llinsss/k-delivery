import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "./db";

export async function authenticateProvider(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const raw = header.slice(7);
  if (!raw.startsWith("kd_")) return null;
  const hash = createHash("sha256").update(raw).digest("hex");
  const candidates = await db.apiKey.findMany({ where: { revokedAt: null, prefix: { startsWith: raw.slice(0, 8) } }, include: { provider: true } });
  const matched = candidates.find((candidate: typeof candidates[number]) => timingSafeEqual(Buffer.from(candidate.keyHash, "hex"), Buffer.from(hash, "hex")));
  if (!matched || matched.provider.status !== "ACTIVE") return null;
  await db.apiKey.update({ where: { id: matched.id }, data: { lastUsedAt: new Date() } });
  return matched;
}

