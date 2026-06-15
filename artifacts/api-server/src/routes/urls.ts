import { Router, type IRouter } from "express";
import { nanoid } from "nanoid";
import { db, shortUrlsTable, clicksTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { CreateUrlBody, UpdateUrlBody } from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/urls", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  const urls = await db
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
    .orderBy(sql`${shortUrlsTable.createdAt} DESC`);

  res.json(
    urls.map((u) => ({
      ...u,
      customAlias: u.customAlias ?? null,
      expiresAt: u.expiresAt ? u.expiresAt.toISOString() : null,
    }))
  );
});

router.post("/urls", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const parsed = CreateUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { originalUrl, customAlias, expiresAt } = parsed.data;
  const shortCode = customAlias || nanoid(6);

  const [existing] = await db
    .select()
    .from(shortUrlsTable)
    .where(eq(shortUrlsTable.shortCode, shortCode));

  if (existing) {
    res.status(409).json({ error: "Custom alias already taken" });
    return;
  }

  const [url] = await db
    .insert(shortUrlsTable)
    .values({
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning();

  res.status(201).json({
    ...url,
    customAlias: url.customAlias ?? null,
    expiresAt: url.expiresAt ? url.expiresAt.toISOString() : null,
    totalClicks: 0,
  });
});

router.put("/urls/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid URL id" });
    return;
  }

  const body = UpdateUrlBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const userId = req.userId!;
  const { id } = params.data;

  const [url] = await db.select().from(shortUrlsTable).where(eq(shortUrlsTable.id, id));
  if (!url) {
    res.status(404).json({ error: "URL not found" });
    return;
  }

  if (url.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { originalUrl, expiresAt } = body.data;

  const [updated] = await db
    .update(shortUrlsTable)
    .set({
      originalUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .where(eq(shortUrlsTable.id, id))
    .returning();

  const [{ totalClicks }] = await db
    .select({ totalClicks: count(clicksTable.id) })
    .from(clicksTable)
    .where(eq(clicksTable.shortUrlId, id));

  res.json({
    ...updated,
    customAlias: updated.customAlias ?? null,
    expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
    totalClicks,
  });
});

router.delete("/urls/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid URL id" });
    return;
  }

  const userId = req.userId!;
  const { id } = params.data;

  const [url] = await db.select().from(shortUrlsTable).where(eq(shortUrlsTable.id, id));
  if (!url) {
    res.status(404).json({ error: "URL not found" });
    return;
  }

  if (url.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(shortUrlsTable).where(eq(shortUrlsTable.id, id));
  res.sendStatus(204);
});

export default router;
