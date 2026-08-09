/* One-off migration helper: pull the original photography off the old
 * WordPress site into _incoming/ so it can be optimised into assets/images/.
 *
 * The old site is HTTP-only (its TLS handshake fails), so these are plain HTTP
 * requests. WordPress stores resized derivatives next to each upload; the
 * un-suffixed filename is the full-size original, which is what we want.
 *
 * Run once:  npm run fetch:images
 * Then:      npm run optimize:images
 *
 * _incoming/ is gitignored — only the optimised WebP under assets/images/ is
 * committed.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

const OUT = path.resolve(__dirname, "..", "_incoming");
const BASE = "http://www.bellavista-formentera.com/wp-content/uploads";

// [remote path, local name] — named by what the file is, not by camera serial.
const FILES = [
  // Branding
  ["2015/05/logo.jpg", "logo-original.jpg"],

  // Homepage hero slider
  ["2015/05/slide5.jpg", "slide-1.jpg"],
  ["2015/05/slide3.jpg", "slide-2.jpg"],
  ["2015/05/slide4.jpg", "slide-3.jpg"],

  // Property shoot, 1 April 2015
  ["2015/05/01042015-_MG_0180.jpg", "property-01.jpg"],
  ["2015/05/01042015-_MG_0183.jpg", "property-02.jpg"],
  ["2015/05/01042015-_MG_0186.jpg", "property-03.jpg"],
  ["2015/05/01042015-_MG_0187.jpg", "property-04.jpg"],
  ["2015/05/01042015-_MG_0190.jpg", "property-05.jpg"],
  ["2015/05/01042015-_MG_0194.jpg", "property-06.jpg"],
  ["2015/05/01042015-_MG_0196.jpg", "property-07.jpg"],
  ["2015/05/01042015-_MG_0197.jpg", "property-08.jpg"],
  ["2015/05/01042015-_MG_0199.jpg", "property-09.jpg"],
  ["2015/05/01042015-_MG_0200.jpg", "property-10.jpg"],
  ["2015/05/01042015-_MG_0202.jpg", "property-11.jpg"],
  ["2015/05/01042015-_MG_0203.jpg", "property-12.jpg"],
  ["2015/05/01042015-_MG_0204.jpg", "property-13.jpg"],
  ["2015/05/01042015-_MG_0206.jpg", "property-14.jpg"],

  // Rooms — the numbers are the real room numbers (201, 208, 213)
  ["2015/05/201-1.jpg", "room-201-1.jpg"],
  ["2015/05/201-2.jpg", "room-201-2.jpg"],
  ["2015/05/201-3.jpg", "room-201-3.jpg"],
  ["2015/05/201-4.jpg", "room-201-4.jpg"],
  ["2015/05/201-5.jpg", "room-201-5.jpg"],
  ["2015/05/208-1.jpg", "room-208-1.jpg"],
  ["2015/05/208-2.jpg", "room-208-2.jpg"],
  ["2015/05/208-3.jpg", "room-208-3.jpg"],
  ["2015/05/208-4.jpg", "room-208-4.jpg"],
  ["2015/05/213_-1.jpg", "room-213-1.jpg"],
  ["2015/05/213_-2.jpg", "room-213-2.jpg"],
  ["2015/05/213_-3.jpg", "room-213-3.jpg"],
  ["2015/05/213_-4.jpg", "room-213-4.jpg"],
  ["2015/05/213_-5.jpg", "room-213-5.jpg"],
  ["2015/05/213_-6.jpg", "room-213-6.jpg"],
  ["2015/05/213_-7.jpg", "room-213-7.jpg"],
  ["2015/05/213_-8.jpg", "room-213-8.jpg"],
  ["2015/05/213_-9.jpg", "room-213-9.jpg"],

  // Restaurant & food shoot, March 2015
  ["2015/03/0.jpg",  "restaurant-01.jpg"],
  ["2015/03/1.jpg",  "restaurant-02.jpg"],
  ["2015/03/2.jpg",  "restaurant-03.jpg"],
  ["2015/03/3.jpg",  "restaurant-04.jpg"],
  ["2015/03/4.jpg",  "restaurant-05.jpg"],
  ["2015/03/5.jpg",  "restaurant-06.jpg"],
  ["2015/03/31.jpg", "restaurant-07.jpg"],
  ["2015/03/41.jpg", "restaurant-08.jpg"]
];

fs.mkdirSync(OUT, { recursive: true });

function get(url, dest) {
  return new Promise(resolve => {
    http.get(url, res => {
      if (res.statusCode !== 200) {
        res.resume();
        console.log("  ✗", path.basename(dest), "→ HTTP", res.statusCode);
        return resolve(false);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => file.close(() => {
        console.log("  ✓", path.basename(dest), (fs.statSync(dest).size / 1024).toFixed(0) + " KB");
        resolve(true);
      }));
    }).on("error", err => {
      console.log("  ✗", path.basename(dest), "→", err.message);
      resolve(false);
    });
  });
}

(async () => {
  console.log("Fetching", FILES.length, "originals into _incoming/ …");
  let ok = 0;
  for (const [remote, local] of FILES) {
    if (await get(`${BASE}/${remote}`, path.join(OUT, local))) ok++;
  }
  console.log(`\n${ok}/${FILES.length} downloaded.`);
  if (ok < FILES.length) console.log("Missing files are listed above — re-run or source them from the owner.");
})();
