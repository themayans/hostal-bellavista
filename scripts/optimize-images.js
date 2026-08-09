/* Turn the originals in _incoming/ into web-ready WebP under assets/images/.
 *
 * For every content image this emits THREE widths — 480, 960 and full — named
 * `foo-480.webp`, `foo-960.webp`, `foo.webp`. main.js builds a srcset from the
 * base filename alone, so no extra data has to be threaded through i18n.js.
 * Without this a 390 px phone downloads the full 1280–1800 px file.
 *
 * Prints a paste-ready manifest with real pixel dimensions — those go into
 * GALLERY and ROOMS in js/i18n.js so every <img> carries explicit width/height
 * and the page never shifts while images load.
 *
 * Run:  npm run optimize:images
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IN  = path.resolve(__dirname, "..", "_incoming");
const OUT = path.resolve(__dirname, "..", "assets", "images");

/* Two photo sources, and it matters which wins where:
 *   _incoming/       the 2015 WordPress shoot — good exteriors, but the ROOM
 *                    photos are pre-refurbishment and now misrepresent the
 *                    property (blue floral bedspreads, dated fittings).
 *   _incoming/c2t/   the property's current shoot — renovated rooms, better
 *                    restaurant and marina photography, higher resolution.
 * Rooms, restaurant and the best marina shots therefore come from c2t/;
 * the exteriors, which are still accurate, come from the 2015 set.        */

// [source in _incoming, output name, options]
const JOBS = [
  // Hero + social card
  ["property-06.jpg", "hero.webp",              { max: 2000 }],
  ["property-06.jpg", "og-image.jpg",           { max: 1200, jpeg: true, crop: [1200, 630] }],

  // Section imagery
  ["property-02.jpg", "hostal-exterior.webp",   { max: 1200 }],
  ["c2t/87-03bellvista1300x870.jpg", "restaurant-terrace.webp", { max: 1400 }],

  // Room cards — CURRENT photography (the rooms have been refurbished since
  // the 2015 shoot; using the old images would show guests worse rooms than
  // they will actually get).
  ["c2t/131-09bellvistaport1800x935.jpg", "room-economica.webp",   { max: 1400 }],
  ["c2t/132-10bellvistaport1800x935.jpg", "room-estandar.webp",    { max: 1400 }],
  ["c2t/129-13bellvistaport1800x935.jpg", "room-vistapuerto.webp", { max: 1400 }],
  // Apartment cards — see HANDOVER.md: the old site used hostal room photos
  // for the off-site apartments. These are placeholders until the owner
  // supplies real photography of Can Loca, Can Peix and Barbaroja.
  ["room-201-2.jpg", "apt-can-loca.webp",       { max: 1200 }],
  ["room-208-4.jpg", "apt-can-peix.webp",       { max: 1200 }],
  ["room-213-8.jpg", "apt-barbaroja.webp",      { max: 1200 }],

  // Gallery — property
  ["property-01.jpg", "gallery-facade-sign.webp",   { max: 1400 }],
  ["property-03.jpg", "gallery-facade-low.webp",    { max: 1400 }],
  ["property-04.jpg", "gallery-facade-olive.webp",  { max: 1400 }],
  ["property-05.jpg", "gallery-facade-palm.webp",   { max: 1400 }],
  ["property-07.jpg", "gallery-palms.webp",         { max: 1400 }],
  ["property-09.jpg", "gallery-fishing-boat.webp",  { max: 1400 }],
  ["property-10.jpg", "gallery-property-10.webp",   { max: 1400 }],
  ["property-11.jpg", "gallery-property-11.webp",   { max: 1400 }],
  ["property-12.jpg", "gallery-property-12.webp",   { max: 1400 }],
  ["property-13.jpg", "gallery-property-13.webp",   { max: 1400 }],
  ["property-14.jpg", "gallery-property-14.webp",   { max: 1400 }],
  ["slide-2.jpg",     "gallery-promenade.webp",     { max: 1900 }],
  ["slide-3.jpg",     "gallery-marina.webp",        { max: 1900 }],

  // Gallery — restaurant. The dishes come from the 2015 shoot (there are no
  // newer photos of the signature dishes); the rooms and terrace come from
  // the current one.
  ["restaurant-04.jpg", "gallery-chipirones.webp",   { max: 1400 }],
  ["restaurant-05.jpg", "gallery-mariscada.webp",    { max: 1400 }],
  ["restaurant-06.jpg", "gallery-paella.webp",       { max: 1400 }],

  // Gallery — current photography
  ["c2t/97-00bellvista1300x870.jpg",  "gallery-food-marina.webp",  { max: 1300 }],
  ["c2t/90-06bellvista1300x870.jpg",  "gallery-marina-view.webp",  { max: 1300 }],
  ["c2t/105-06bellvistaport1800x935.jpg", "gallery-dining-room.webp", { max: 1400 }],
  ["c2t/98-01bellvista1300x870.jpg",  "gallery-dining-bar.webp",   { max: 1300 }],
  ["c2t/107-08bellvistaport1800x935.jpg", "gallery-lounge.webp",   { max: 1400 }],
  ["c2t/94-11bellvista1300x870.jpg",  "gallery-reception.webp",    { max: 1300 }],
  ["c2t/100-04bellvistaport1800x935.jpg", "gallery-port-wide.webp", { max: 1800 }],

  // Gallery — rooms
  ["room-201-3.jpg", "gallery-room-201.webp", { max: 1400 }],
  ["room-213-2.jpg", "gallery-room-213.webp", { max: 1400 }],
  ["room-213-7.jpg", "gallery-marina-palms.webp", { max: 1400 }],

  // Favicon / touch icon from the original logo
  ["logo-original.jpg", "logo.png",            { max: 400, png: true }],
  ["logo-original.jpg", "favicon.png",         { max: 64,  png: true }],
  ["logo-original.jpg", "apple-touch-icon.png",{ max: 180, png: true }]
];

fs.mkdirSync(OUT, { recursive: true });

// Widths emitted alongside the full-size file, for srcset.
const VARIANTS = [480, 960];

(async () => {
  const manifest = [];
  let bytesIn = 0, bytesOut = 0, variantCount = 0;

  for (const [src, out, opt] of JOBS) {
    const srcPath = path.join(IN, src);
    if (!fs.existsSync(srcPath)) { console.log("  ✗ missing source:", src); continue; }

    const outPath = path.join(OUT, out);
    let img = sharp(srcPath).rotate();          // honour EXIF orientation

    if (opt.crop) {
      img = img.resize(opt.crop[0], opt.crop[1], { fit: "cover", position: "attention" });
    } else {
      img = img.resize(opt.max, opt.max, { fit: "inside", withoutEnlargement: true });
    }

    if (opt.jpeg)      img = img.jpeg({ quality: 84, mozjpeg: true });
    else if (opt.png)  img = img.png({ compressionLevel: 9 });
    else               img = img.webp({ quality: 82 });

    const info = await img.toFile(outPath);
    bytesIn  += fs.statSync(srcPath).size;
    bytesOut += info.size;

    console.log("  ✓", out.padEnd(30), `${info.width}×${info.height}`, (info.size / 1024).toFixed(0) + " KB");

    // Narrow variants for srcset. Icons and the social card don't need them.
    if (!opt.png && !opt.jpeg && !opt.noVariants) {
      for (const w of VARIANTS) {
        if (w >= info.width) continue;                    // never upscale
        const vOut = out.replace(/\.webp$/, `-${w}.webp`);
        const v = await sharp(srcPath).rotate()
          .resize(w, null, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(OUT, vOut));
        bytesOut += v.size; variantCount++;
        console.log("      ↳", vOut.padEnd(34), `${v.width}×${v.height}`, (v.size / 1024).toFixed(0) + " KB");
      }
    }

    if (out.startsWith("gallery-") || out.startsWith("room-") || out.startsWith("apt-")) {
      manifest.push(`  { id: "${out.replace(/\.webp$/, "").replace(/^gallery-/, "")}", src: "assets/images/${out}", w: ${info.width}, h: ${info.height} },`);
    }
  }
  console.log(`\n${variantCount} srcset variants emitted`);

  console.log(`\n${(bytesIn / 1048576).toFixed(1)} MB in → ${(bytesOut / 1048576).toFixed(1)} MB out`);
  console.log("\nPaste-ready entries for js/i18n.js:\n");
  console.log(manifest.join("\n"));
})();
