import { Router, type IRouter } from "express";
import { db, shortUrlsTable, clicksTable } from "@workspace/db";
import { eq, count, sql, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { z } from "zod";

const router: IRouter = Router();

const IdParam = z.object({ id: z.coerce.number().int().positive() });
const ShortCodeParam = z.object({ shortCode: z.string().min(1) });

function groupBreakdown(rows: Array<{ name: string | null; count: number }>) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const name = row.name ?? "Unknown";
    map.set(name, (map.get(name) ?? 0) + row.count);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

router.get("/urls/:id/analytics", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid URL id" });
    return;
  }

  const userId = req.userId!;
  const { id } = params.data;

  const [url] = await db
    .select()
    .from(shortUrlsTable)
    .where(eq(shortUrlsTable.id, id));

  if (!url) {
    res.status(404).json({ error: "URL not found" });
    return;
  }

  if (url.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [{ totalClicks }] = await db
    .select({ totalClicks: count(clicksTable.id) })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, id));

  const recentClicks = await db
    .select({
      id: clicksTable.id,
      timestamp: clicksTable.timestamp,
      ipAddress: clicksTable.ipAddress,
      userAgent: clicksTable.userAgent,
      browser: clicksTable.browser,
      device: clicksTable.device,
    })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, id))
    .orderBy(desc(clicksTable.timestamp))
    .limit(20);

  const lastVisitedResult = await db
    .select({ ts: clicksTable.timestamp })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, id))
    .orderBy(desc(clicksTable.timestamp))
    .limit(1);

  const lastVisited = lastVisitedResult[0]?.ts ?? null;

  const dailyClicksRaw = await db
    .select({
      date: sql<string>`DATE(${clicksTable.timestamp})`.as("date"),
      count: count(clicksTable.id),
    })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, id))
    .groupBy(sql`DATE(${clicksTable.timestamp})`)
    .orderBy(sql`DATE(${clicksTable.timestamp})`);

  const browserRaw = await db
    .select({ name: clicksTable.browser, count: count(clicksTable.id) })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, id))
    .groupBy(clicksTable.browser);

  const deviceRaw = await db
    .select({ name: clicksTable.device, count: count(clicksTable.id) })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, id))
    .groupBy(clicksTable.device);

  res.json({
    totalClicks,
    lastVisited: lastVisited ? lastVisited.toISOString() : null,
    recentClicks: recentClicks.map((c) => ({
      ...c,
      ipAddress: c.ipAddress ?? null,
      userAgent: c.userAgent ?? null,
      browser: c.browser ?? null,
      device: c.device ?? null,
      timestamp: c.timestamp.toISOString(),
    })),
    dailyClicks: dailyClicksRaw.map((d) => ({ date: d.date, count: d.count })),
    browserBreakdown: groupBreakdown(browserRaw),
    deviceBreakdown: groupBreakdown(deviceRaw),
    shortUrl: {
      ...url,
      customAlias: url.customAlias ?? null,
      expiresAt: url.expiresAt ? url.expiresAt.toISOString() : null,
      totalClicks,
    },
  });
});

router.get("/stats/:shortCode", async (req, res): Promise<void> => {
  const params = ShortCodeParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid short code" });
    return;
  }

  const { shortCode } = params.data;

  const [url] = await db
    .select()
    .from(shortUrlsTable)
    .where(eq(shortUrlsTable.shortCode, shortCode));

  if (!url) {
    res.status(404).json({ error: "URL not found" });
    return;
  }

  const [{ totalClicks }] = await db
    .select({ totalClicks: count(clicksTable.id) })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, url.id));

  const lastVisitedResult = await db
    .select({ ts: clicksTable.timestamp })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, url.id))
    .orderBy(desc(clicksTable.timestamp))
    .limit(1);

  const lastVisited = lastVisitedResult[0]?.ts ?? null;

  const dailyClicksRaw = await db
    .select({
      date: sql<string>`DATE(${clicksTable.timestamp})`.as("date"),
      count: count(clicksTable.id),
    })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, url.id))
    .groupBy(sql`DATE(${clicksTable.timestamp})`)
    .orderBy(sql`DATE(${clicksTable.timestamp})`);

  const browserRaw = await db
    .select({ name: clicksTable.browser, count: count(clicksTable.id) })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, url.id))
    .groupBy(clicksTable.browser);

  const deviceRaw = await db
    .select({ name: clicksTable.device, count: count(clicksTable.id) })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, url.id))
    .groupBy(clicksTable.device);

  res.json({
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    createdAt: url.createdAt.toISOString(),
    expiresAt: url.expiresAt ? url.expiresAt.toISOString() : null,
    totalClicks,
    lastVisited: lastVisited ? lastVisited.toISOString() : null,
    dailyClicks: dailyClicksRaw.map((d) => ({ date: d.date, count: d.count })),
    browserBreakdown: groupBreakdown(browserRaw),
    deviceBreakdown: groupBreakdown(deviceRaw),
  });
});

export default router;
