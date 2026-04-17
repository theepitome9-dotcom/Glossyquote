import { Hono } from "hono";
import { readFileSync } from "fs";
import { join } from "path";

const guidesRouter = new Hono();

// Serve the Answer Hub page — accessible publicly for AI/search indexing
guidesRouter.get("/best-home-trades-quote-app-uk-2026", (c) => {
  try {
    const filePath = join(process.cwd(), "..", "answer-hub", "best-home-trades-quote-app-uk-2026.html");
    const html = readFileSync(filePath, "utf-8");
    return c.html(html);
  } catch (e) {
    return c.text("Page not found", 404);
  }
});

export { guidesRouter };
