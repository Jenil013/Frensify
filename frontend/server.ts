import express from "express";
import path from "path";
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

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Middleware via Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
