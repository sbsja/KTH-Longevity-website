/**
 * Minimal static server for the exported site in ./out (what `npm run build` produces).
 * Resolves /path/ to /path/index.html and serves 404.html for unknown routes.
 *
 *   node scripts/serve-out.mjs [port]   (default 3011)
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 3011);
// Mirror a sub-path host (GitHub Pages project site): BASE_PATH=/repo-name
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
};

if (!existsSync(root)) {
  console.error("No ./out folder. Run `npm run build` first.");
  process.exit(1);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    if (basePath) {
      if (pathname === basePath || pathname.startsWith(basePath + "/")) pathname = pathname.slice(basePath.length) || "/";
      else {
        res.writeHead(404, { "content-type": "text/plain" }).end(`Not under ${basePath}/`);
        return;
      }
    }
    let file = path.join(root, pathname);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
    else if (!existsSync(file) && existsSync(file + ".html")) file = file + ".html";
    let status = 200;
    if (!existsSync(file)) {
      file = path.join(root, "404.html");
      status = 404;
    }
    res.writeHead(status, { "content-type": types[path.extname(file)] ?? "application/octet-stream", "cache-control": "no-cache" });
    createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Serving ./out at http://localhost:${port}${basePath}/`));
