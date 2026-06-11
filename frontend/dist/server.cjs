var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_express = __toESM(require("express"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = 3e3;
app.get("/api/config", (req, res) => {
  res.json({
    hasGeminiKey: true,
    appName: "Frensify",
    backendStatus: "FastAPI & Supabase Target Configured",
    status: "ok"
  });
});
function shouldServeSpaShell(url) {
  const pathname = url.split("?")[0];
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/@")) return false;
  if (pathname.startsWith("/node_modules/")) return false;
  if (pathname.startsWith("/src/")) return false;
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false;
  return true;
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    const indexPath = import_node_path.default.resolve(process.cwd(), "index.html");
    app.use(async (req, res, next) => {
      if (!shouldServeSpaShell(req.originalUrl)) {
        return next();
      }
      try {
        const template = import_node_fs.default.readFileSync(indexPath, "utf-8");
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error);
        next(error);
      }
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_node_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_node_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Frensify client delivery server running successfully on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
