import { Router, type IRouter } from "express";
import { db, shortUrlsTable, clicksTable } from "@workspace/db";
import { eq, count, sql, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  const [{ totalUrls }] = await db
    .select({ totalUrls: count(shortUrlsTable.id) })
    .from(shortUrlsTable)
    .where(eq(shortUrlsTable.userId, userId));

  const now = new Date();
  const [{ activeUrls }] = await db
    .select({ activeUrls: count(shortUrlsTable.id) })
    .from(shortUrlsTable)
    .where(
      sql`${shortUrlsTable.userId} = ${userId} AND (${shortUrlsTable.expiresAt} IS NULL OR ${shortUrlsTable.expiresAt} > ${now})`
    );

  const clickCountRows = await db
    .select({ totalClicks: count(clicksTable.id) })
    .from(clicksTable)
    .innerJoin(shortUrlsTable, eq(clicksTable.shortUrlId, shortUrlsTable.id))
    .where(eq(shortUrlsTable.userId, userId));

  const totalClicks = clickCountRows[0]?.totalClicks ?? 0;

  const topUrlRows = await db
    .select({
      id: shortUrlsTable.id,
      userId: shortUrlsTable.userId,
      originalUrl: shortUrlsTable.originalUrl,
      shortCode: shortUrlsTable.shortCode,
      customAlias: shortUrlsTable.customAlias,
      expiresAt: shortUrlsTable.expiresAt,
      createdAt: shortUrlsTable.createdAt,
      totalClicks: count(clicksTable.id),
    })
    .from(shortUrlsTable)
    .leftJoin(clicksTable, eq(clicksTable.shortUrlId, shortUrlsTable.id))
    .where(eq(shortUrlsTable.userId, userId))
    .groupBy(shortUrlsTable.id)
    .orderBy(desc(count(clicksTable.id)))
    .limit(1);

  const topUrl = topUrlRows[0]
    ? {
        ...topUrlRows[0],
        customAlias: topUrlRows[0].customAlias ?? null,
        expiresAt: topUrlRows[0].expiresAt ? topUrlRows[0].expiresAt.toISOString() : null,
      }
    : undefined;

  res.json({ totalUrls, totalClicks, activeUrls, topUrl });
});

export default router;
