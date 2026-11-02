/**
 * Local preview server for the logo motion lab.
 *
 *   node experiments/logo-motion/serve.mjs [port]      (default 3020)
 *
 * Binds to 127.0.0.1 only. Serves the lab folder plus an explicit allowlist of files
 * the lab needs from elsewhere in the repository: the supplied logo PNG and the static
 * backdrop from /public, GSAP and Three.js from node_modules, and the three self-hosted
 * fonts the site uses. Nothing else on disk is reachable.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const port = Number(process.argv[2] ?? process.env.PORT ?? 3020);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

// Files outside the lab folder, by URL. Add to this list deliberately.
const external = {
  "/site/brand/kth-longevity-logo.png": "public/brand/kth-longevity-logo.png",
  "/site/backdrop.svg": "public/backdrop.svg",
  "/favicon.svg": "src/app/icon.svg",
  "/vendor/gsap.min.js": "node_modules/gsap/dist/gsap.min.js",
  "/vendor/three.module.js": "node_modules/three/build/three.module.js",
  "/vendor/three.core.js": "node_modules/three/build/three.core.js",
  "/vendor/fonts/outfit.woff2": "node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2",
  "/vendor/fonts/instrument-sans.woff2": "node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
  "/vendor/fonts/instrument-sans-italic.woff2": "node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-italic.woff2",
  "/vendor/fonts/jetbrains-mono.woff2": "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
};

// Lab files that are not meant for the browser.
const privateInLab = new Set(["/serve.mjs", "/README.md", "/NOTES.md"]);

function resolve(pathname) {
  if (pathname === "/") pathname = "/index.html";
  if (external[pathname]) return path.join(repo, external[pathname]);
  if (privateInLab.has(pathname) || pathname.startsWith("/tests/")) return null;
  const file = path.normalize(path.join(here, pathname));
  if (!file.startsWith(here + path.sep)) return null; // no traversal
  return file;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  const file = resolve(pathname);
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end(`Not served: ${pathname}`);
    return;
  }
  res.writeHead(200, {
    "content-type": types[path.extname(file)] ?? "application/octet-stream",
    "cache-control": "no-cache",
  });
  createReadStream(file).pipe(res);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is in use. Try: node experiments/logo-motion/serve.mjs ${port + 1}`);
    process.exit(1);
  }
  throw err;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Logo motion lab: http://localhost:${port}/`);
});
