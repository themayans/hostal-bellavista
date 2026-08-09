/* Local preview server — no dependencies, just Node.
 *
 *     npm start        →  http://localhost:8091/hostal-bellavista/
 *
 * Why this exists rather than any off-the-shelf static server: the generated
 * pages reference assets by absolute path (/hostal-bellavista/css/styles.css),
 * because that is the base path GitHub Pages serves the project from. Serving
 * the repo root at "/" would therefore 404 every stylesheet, script and image.
 * This server mounts the repo under that same prefix, so what you see locally
 * is what deploys.
 *
 * After the custom-domain cutover, set BASE = "" here too (and in the three
 * scripts/build-*.js files) and the site will be served from "/".
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE = "/hostal-bellavista";        // "" once on the custom domain
const PORT = Number(process.env.PORT) || 8091;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml":  "application/xml; charset=utf-8",
  ".txt":  "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon"
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  // Redirect "/" to the base path so the printed URL is always the right one
  if (BASE && (urlPath === "/" || urlPath === "")) {
    res.writeHead(302, { Location: BASE + "/" });
    return res.end();
  }
  if (BASE && urlPath.startsWith(BASE)) urlPath = urlPath.slice(BASE.length) || "/";

  // Resolve inside ROOT only — never serve anything above the project
  let file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  if (urlPath.endsWith("/")) file = path.join(file, "index.html");

  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(`<h1>404</h1><p>Not found: ${urlPath}</p>
        <p>Have you run <code>npm run build</code>?</p>
        <p><a href="${BASE}/">Back to the homepage</a></p>`);
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"          // always see your latest build
    });
    res.end(buf);
  });
}).listen(PORT, () => {
  console.log(`\n  Hostal Bellavista — local preview\n`);
  console.log(`    http://localhost:${PORT}${BASE}/        Spanish (default)`);
  ["en", "it", "de", "ca"].forEach(l =>
    console.log(`    http://localhost:${PORT}${BASE}/${l}/     ${l.toUpperCase()}`));
  console.log(`    http://localhost:${PORT}${BASE}/legal/privacy/es/\n`);
  console.log(`  Ctrl+C to stop.\n`);
});
