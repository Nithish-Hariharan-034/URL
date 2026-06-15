import { Router, type IRouter } from "express";
import { db, shortUrlsTable, clicksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

const router: IRouter = Router();

router.get("/s/:shortCode", async (req, res): Promise<void> => {
  const shortCode = Array.isArray(req.params.shortCode)
    ? req.params.shortCode[0]
    : req.params.shortCode;

  const [url] = await db
    .select()
    .from(shortUrlsTable)
    .where(eq(shortUrlsTable.shortCode, shortCode));

  if (!url) {
    res.status(404).json({ error: "Short URL not found" });
    return;
  }

  if (url.expiresAt && url.expiresAt < new Date()) {
    res.status(410).json({ error: "Short URL has expired" });
    return;
  }

  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    null;

  const userAgentStr = req.headers["user-agent"] ?? null;

  let browser: string | null = null;
  let device: string | null = null;

  if (userAgentStr) {
    const parser = new UAParser(userAgentStr);
    const result = parser.getResult();
    browser = result.browser.name ?? null;
    const deviceType = result.device.type;
    if (deviceType === "mobile") device = "Mobile";
    else if (deviceType === "tablet") device = "Tablet";
    else device = "Desktop";
  }

  await db.insert(clicksTable).values({
    shortUrlId: url.id,
    ipAddress,
    userAgent: userAgentStr,
    browser,
    device,
  });

  res.redirect(302, url.originalUrl);
});

export default router;
