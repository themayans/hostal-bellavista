/* Generate the 5 per-language homepages from _src/home.html + js/i18n.js.
 *
 * Root "/" = Spanish (the source language); /en/ /it/ /de/ /ca/ = the others.
 * Only text nodes and attributes are swapped — ALL markup is preserved, so the
 * interactive JS (booking bar, gallery, lightbox, form) keeps working.
 *
 * Run:  npm run build:home     (or: node scripts/build-home.js)
 *
 * At custom-domain cutover, set BASE = "" and DOMAIN to the live domain below,
 * update url/baseurl in _config.yml, then re-run. See DOMAIN-CUTOVER.md.
 */
const fs = require("fs"), path = require("path"), cheerio = require("cheerio");

const ROOT   = path.resolve(__dirname, "..");
const BASE   = "/hostal-bellavista";                    // "" once on the custom domain
const DOMAIN = "https://themayans.github.io";           // absolute base for canonical/hreflang/og
const DEFAULT_LANG = "es";                              // served at the root, no prefix

const i18nSrc = fs.readFileSync(path.join(ROOT, "js/i18n.js"), "utf8");
const I18N    = new Function(i18nSrc + "; return I18N;")();
const ROOMS   = new Function(i18nSrc + "; return ROOMS;")();
const MENU    = new Function(i18nSrc + "; return MENU;")();
const FAQ     = new Function(i18nSrc + "; return FAQ;")();
const GALLERY = new Function(i18nSrc + "; return GALLERY;")();
const master  = fs.readFileSync(path.join(ROOT, "_src/home.html"), "utf8");

const LANGS = ["es", "en", "it", "de", "ca"];
const LABEL = { es: "Español", en: "English", it: "Italiano", de: "Deutsch", ca: "Català" };
const OGLOC = { es: "es_ES", en: "en_GB", it: "it_IT", de: "de_DE", ca: "ca_ES" };

const langPath = l => (BASE + (l === DEFAULT_LANG ? "/" : "/" + l + "/")) || "/";
const absPath  = l => DOMAIN + langPath(l);

for (const lang of LANGS) {
  const t = I18N[lang];
  if (!t) { console.warn("!! no I18N entry for", lang, "— skipped"); continue; }

  const $ = cheerio.load(master, { decodeEntities: false });

  $("html").attr("lang", lang);

  /* ---- Text + meta content swap ---- */
  const missing = [];
  $("[data-i18n]").each((i, el) => {
    const $el = $(el), key = $el.attr("data-i18n"), val = t[key];
    if (val == null) { missing.push(key); return; }
    if ((el.tagName || "").toLowerCase() === "meta") $el.attr("content", val);
    else $el.text(val);
  });
  // Attribute-level translations: data-i18n-attr="aria-label:key,placeholder:key2"
  $("[data-i18n-attr]").each((i, el) => {
    const $el = $(el);
    $el.attr("data-i18n-attr").split(",").forEach(pair => {
      const [attr, key] = pair.split(":").map(s => s.trim());
      if (attr && key && t[key] != null) $el.attr(attr, t[key]);
    });
  });

  /* ---- Head: title, canonical, hreflang, Open Graph, Twitter ---- */
  $("title").text(t["meta.title"]);
  $('link[rel="canonical"]').attr("href", absPath(lang));
  $('meta[property="og:title"]').attr("content", t["meta.ogTitle"]);
  $('meta[property="og:description"]').attr("content", t["meta.description"]);
  $('meta[property="og:url"]').attr("content", absPath(lang));
  $('meta[property="og:locale"]').attr("content", OGLOC[lang]);
  $('meta[name="twitter:title"]').attr("content", t["meta.ogTitle"]);
  $('meta[name="twitter:description"]').attr("content", t["meta.description"]);

  $('meta[property="og:locale:alternate"]').remove();
  LANGS.filter(l => l !== lang).forEach(l =>
    $('meta[property="og:locale"]').after('\n  <meta property="og:locale:alternate" content="' + OGLOC[l] + '" />'));

  let hre = "";
  LANGS.forEach(l => { hre += '\n  <link rel="alternate" hreflang="' + l + '" href="' + absPath(l) + '" />'; });
  hre += '\n  <link rel="alternate" hreflang="x-default" href="' + absPath(DEFAULT_LANG) + '" />';
  $('link[rel="canonical"]').after(hre);

  /* ---- Structured data ------------------------------------------------
     The hand-written @graph in the template carries the facts that don't
     change per language (address, geo, amenities). Everything derived from
     content — the rooms, the menu, the FAQ, the gallery — is generated here
     from the SAME data that renders the page, so the markup and the visible
     page can never drift apart. That drift is the usual reason rich results
     get penalised. */
  $('script[type="application/ld+json"]').each((i, el) => {
    let json;
    try { json = JSON.parse($(el).html()); } catch (e) { return; }
    const graph = Array.isArray(json["@graph"]) ? json["@graph"] : [json];

    graph.forEach(node => {
      const type = node["@type"];
      if (type === "Hotel" || type === "Restaurant" || type === "LodgingBusiness") {
        node.description = t[type === "Restaurant" ? "meta.restaurantDescription" : "meta.description"];
        node.url = absPath(lang);
      }
    });

    const hotel = graph.find(n => n["@type"] === "Hotel");
    const restaurant = graph.find(n => n["@type"] === "Restaurant");
    const abs = p => DOMAIN + BASE + "/" + p;

    if (hotel) {
      hotel.inLanguage = LANGS;
      hotel.availableLanguage = ["es", "ca", "en", "it"];   // languages actually spoken at reception
      hotel.photo = GALLERY.slice(0, 8).map(g => ({
        "@type": "ImageObject",
        contentUrl: abs(g.src),
        width: g.w, height: g.h,
        caption: t["gallery." + g.id] || ""
      }));
      // Room types. No price is published, so no Offer is claimed — asserting
      // a price we don't have would be worse than omitting it.
      hotel.containsPlace = ROOMS.filter(r => r.type === "room").map(r => ({
        "@type": "HotelRoom",
        name: t["room." + r.id + ".name"],
        description: t["room." + r.id + ".desc"],
        image: abs(r.img),
        bed: { "@type": "BedDetails", typeOfBed: t["room.beds." + r.beds] },
        occupancy: { "@type": "QuantitativeValue", maxValue: r.guests, unitText: "person" },
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
          { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
          { "@type": "LocationFeatureSpecification", name: "Private bathroom", value: true }
        ]
      }));
    }

    if (restaurant) {
      restaurant.hasMenu = {
        "@type": "Menu",
        name: t["restaurant.title"],
        inLanguage: lang,
        hasMenuSection: MENU.map(course => ({
          "@type": "MenuSection",
          name: t["menu.course." + course.id],
          hasMenuItem: course.items.map(item => {
            const mi = { "@type": "MenuItem", name: t["menu." + item.id + ".name"] };
            const d = t["menu." + item.id + ".desc"];
            if (d) mi.description = d;
            if (item.price) mi.offers = { "@type": "Offer", price: item.price, priceCurrency: "EUR" };
            return mi;
          })
        }))
      };
    }

    // Site-level nodes
    graph.push({
      "@type": "WebSite",
      "@id": DOMAIN + BASE + "/#website",
      url: absPath(lang),
      name: "Hostal Restaurante Bellavista Formentera",
      inLanguage: lang,
      publisher: { "@id": DOMAIN + BASE + "/#hotel" }
    });
    graph.push({
      "@type": "WebPage",
      "@id": absPath(lang) + "#webpage",
      url: absPath(lang),
      name: t["meta.title"],
      description: t["meta.description"],
      inLanguage: lang,
      isPartOf: { "@id": DOMAIN + BASE + "/#website" },
      about: { "@id": DOMAIN + BASE + "/#hotel" },
      primaryImageOfPage: abs("assets/images/hero.webp")
    });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t["meta.ogTitle"], item: absPath(lang) }
      ]
    });
    // FAQ — every answer is a fact the property publishes; see js/i18n.js.
    graph.push({
      "@type": "FAQPage",
      "@id": absPath(lang) + "#faq",
      mainEntity: FAQ.map(q => ({
        "@type": "Question",
        name: t["faq." + q.id + ".q"],
        acceptedAnswer: { "@type": "Answer", text: t["faq." + q.id + ".a"] }
      }))
    });

    json["@graph"] = graph;
    $(el).text(JSON.stringify(json, null, 2));
  });

  /* ---- Rewrite root-relative asset/link paths for the deploy base ---- */
  // Markup is authored with paths like "css/styles.css" (no leading slash);
  // anything already absolute, protocol-relative, a fragment, or a scheme is
  // left alone.
  const isAbsolute = v => /^(https?:|\/\/|#|data:|mailto:|tel:|whatsapp:|\/)/i.test(v);

  $("link[href], script[src], img[src], a[href], form[action], iframe[src]").each((i, el) => {
    const tag = (el.tagName || "").toLowerCase();
    let attr = "href";
    if (tag === "script" || tag === "img" || tag === "iframe") attr = "src";
    else if (tag === "form") attr = "action";
    const v = $(el).attr(attr);
    if (!v || isAbsolute(v)) return;
    $(el).attr(attr, BASE + "/" + v);
  });

  /* srcset and imagesrcset are comma-separated candidate lists, so they need
     rewriting entry by entry — not as a single URL.
     This bit is load-bearing: a relative srcset on /en/ resolves against
     /en/, i.e. /hostal-bellavista/en/assets/…, which 404s. The browser
     prefers srcset over src, so the image silently breaks on every language
     page except the Spanish root (where the relative path happens to be
     correct). That is exactly how it shipped broken once already. */
  $("img[srcset], source[srcset], link[imagesrcset]").each((i, el) => {
    const attr = el.tagName.toLowerCase() === "link" ? "imagesrcset" : "srcset";
    const v = $(el).attr(attr);
    if (!v) return;
    $(el).attr(attr, v.split(",").map(part => {
      const s = part.trim();
      if (!s) return "";
      const sp = s.indexOf(" ");
      const url = sp === -1 ? s : s.slice(0, sp);
      const desc = sp === -1 ? "" : s.slice(sp);
      return (isAbsolute(url) ? url : BASE + "/" + url) + desc;
    }).filter(Boolean).join(", "));
  });

  /* ---- Language menu + in-page language-aware links ---- */
  $("#langCurrent").text(lang.toUpperCase());
  const $menu = $("#langMenu");
  $menu.empty();
  LANGS.forEach(l => {
    const cur = l === lang ? ' aria-current="true"' : "";
    $menu.append('\n            <li><a href="' + langPath(l) + '" data-lang="' + l + '" role="menuitem"' + cur + ">" + LABEL[l] + "</a></li>");
  });
  // Legal pages live at /legal/<ref>/<lang>/ (Jekyll collection)
  $("[data-legal]").each((i, el) => {
    $(el).attr("href", BASE + "/legal/" + $(el).attr("data-legal") + "/" + lang + "/");
  });

  /* ---- First-visit language redirect (root/Spanish page only) ---- */
  if (lang === DEFAULT_LANG) {
    const supported = JSON.stringify(LANGS.filter(l => l !== DEFAULT_LANG));
    const redir =
      '<script>(function(){try{' +
      'var s=localStorage.getItem("bv_lang");var supp=' + supported + ";" +
      'var w=s||(navigator.language||"").slice(0,2).toLowerCase();' +
      'if(w&&w!=="' + DEFAULT_LANG + '"&&supp.indexOf(w)>=0){location.replace("' + BASE + '/"+w+"/");}' +
      "}catch(e){}})();<\/script>";
    $("head").prepend("\n  " + redir + "\n");
  }

  /* ---- Write ---- */
  const outRel  = lang === DEFAULT_LANG ? "index.html" : path.join(lang, "index.html");
  const outPath = path.join(ROOT, outRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, $.html());

  const note = missing.length ? "  ⚠ " + missing.length + " missing key(s): " + [...new Set(missing)].join(", ") : "";
  console.log("wrote", outRel.padEnd(16), "(lang=" + lang + ")" + note);
}
console.log("done");
