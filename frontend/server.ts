import fs from "node:fs";
import path from "node:path";
import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Initialize environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Clean lightweight health-check / indicator that aligns with user's FastAPI setup
app.get("/api/config", (req, res) => {
  res.json({
    hasGeminiKey: true,
    appName: "Frensify",
    backendStatus: "FastAPI & Supabase Target Configured",
    status: "ok"
  });
});

function shouldServeSpaShell(url: string): boolean {
  const pathname = url.split("?")[0];
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/@")) return false;
  if (pathname.startsWith("/node_modules/")) return false;
  if (pathname.startsWith("/src/")) return false;
  // Let Vite serve files with extensions (e.g. /fevicon_Logo.svg).
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false;
  return true;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    const indexPath = path.resolve(process.cwd(), "index.html");

    // Serve index.html before Vite middleware. In Docker, cwd is /app — the same
    // path as our /app route — so Vite would otherwise try to read that directory.
    app.use(async (req, res, next) => {
      const pathname = req.path || req.originalUrl.split("?")[0];
      if (!shouldServeSpaShell(pathname)) {
        return next();
      }
      try {
        const template = fs.readFileSync(indexPath, "utf-8");
        const html = await vite.transformIndexHtml(pathname, template);
        return res
          .status(200)
          .set({ "Content-Type": "text/html" })
          .end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        return next(error);
      }
    });

    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Frensify client delivery server running successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
