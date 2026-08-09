/* ===================================================================
   Hostal Restaurante Bellavista Formentera — behaviour

   Sticky header, mobile nav, language menu, hero booking bar (date +
   guest picker that deep-links into Amenitiz), room cards, restaurant
   menu tabs, gallery + lightbox, and the enquiry form.

   Content lives in js/i18n.js. Settings live in the CONFIG block below.
   =================================================================== */

/* ---- CONFIG ----------------------------------------------------------------

   BOOKING — the property sells through Amenitiz. `base` is the booking engine
   URL; `params` maps our internal field names onto Amenitiz's query string.

   ⚠ VERIFY BEFORE LAUNCH: the parameter names below are the common Amenitiz
   pattern, but they have not been confirmed against this property's engine.
   Open a generated link with dates selected and check the engine pre-fills
   them. If it does not, adjust `params` — nothing else needs to change.
   If the engine ignores the query string entirely, set `params: null` and the
   buttons will simply link to the booking home page.

   LOCALE — Amenitiz serves per-language paths. `locales` maps our site
   languages onto the engine's; anything unmapped falls back to `es`.        */
const BOOKING = {
  base: "https://hostal-bellavista.amenitiz.io/{locale}/booking/room",

  // Verified against the live engine: es, en and it are served; de, ca and fr
  // silently 302 to /es/. So we send German and Catalan guests to Spanish
  // rather than through a pointless redirect.
  locales: { es: "es", en: "en", it: "it", de: "es", ca: "es" },

  // The engine is a client-rendered SPA and the property's own site never
  // pre-fills dates (its booking widget posts to an empty form action — it is
  // broken there). Query-string pre-fill is therefore UNVERIFIED: these are
  // Amenitiz's conventional names, sent on the assumption that unknown params
  // are ignored rather than rejected.
  //   → See HANDOVER.md §1.2. If the engine ignores them, set params: null and
  //     the buttons become plain links to the booking home page.
  params: { checkin: "checkin", checkout: "checkout", adults: "adults", children: "children" },

  // Per-room deep links: NOT AVAILABLE. Every "Reservar" button on the
  // property's own site points at the same generic booking URL, and the engine
  // mounts with roomId:null. Leaving this empty makes every room card link to
  // the generic engine, which is what the property already does.
  rooms: {}
};

/* ENQUIRY FORM — FormSubmit (https://formsubmit.co): free, no signup, no
   backend needed. The destination address is the form's `action` in the HTML.
   ⚠ FIRST SUBMISSION: FormSubmit emails that address a one-time confirmation
   link. Click it once to activate; enquiries only arrive after that.
   To hide the address publicly, swap it for the random alias FormSubmit
   issues after activation. */
const CONTACT_EMAIL = "reservas@hostal-bellavista.com";

/* An empty string means "we don't have this channel" — the link is REMOVED
   from the page rather than shipped pointing nowhere.

   ⚠ Do not copy the social links from hostal-bellavista.com. Its Instagram,
   Twitter and YouTube icons point at unrelated third-party commerce domains
   (mlsplayershop.com, collegebasketball-online.com, collegeplayersshop.com) —
   an abandoned or hijacked CMS field. Only the Facebook page is genuine. */
const CONTACT = {
  phone:     "+34971323324",
  phone2:    "+34971322255",
  whatsapp:  "",                       // e.g. "34600000000"
  email:     "reservas@hostal-bellavista.com",
  // Coordinates from the property's current site (more precise than the 2015 one)
  mapsUrl:   "https://www.google.com/maps/search/?api=1&query=38.7326075,1.4156931",
  facebook:  "https://www.facebook.com/HostalRestauranteBellavista/",
  instagram: "",                       // real handle not published anywhere — ask the owner
  tripadvisorHotel:      "https://www.tripadvisor.com/Hotel_Review-g1188766-d1733515",
  tripadvisorRestaurant: "https://www.tripadvisor.com/Restaurant_Review-g1188766-d17593739"
};

const MAX_GUESTS = 6;
const SUPPORTED  = ["es", "en", "it", "de", "ca"];
/* -------------------------------------------------------------------------- */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* Asset base — derived from where this script is served, so relative image
   paths resolve on any page depth (/, /en/, /legal/…) and on any domain
   (github.io/hostal-bellavista or the custom domain later). */
const ASSET_BASE = (function () {
  const s = document.currentScript && document.currentScript.src;
  return s ? s.replace(/js\/main\.js.*$/, "") : "";
})();

/* Build a srcset from a base image path. scripts/optimize-images.js emits
   `foo-480.webp` and `foo-960.webp` next to every `foo.webp`, so the variants
   are derivable from the filename and don't need storing in i18n.js.
   `w` is the full-size width, used to avoid advertising a variant that is
   wider than the original. */
function srcsetFor(src, w) {
  const set = [];
  for (const v of [480, 960]) if (v < w) set.push(`${ASSET_BASE}${src.replace(/\.webp$/, `-${v}.webp`)} ${v}w`);
  set.push(`${ASSET_BASE}${src} ${w}w`);
  return set.join(", ");
}

const LANG = document.documentElement.lang || "es";
const DICT = (typeof I18N !== "undefined" && (I18N[LANG] || I18N.es)) || {};
const t = key => (DICT[key] != null ? DICT[key] : key);

/* ---------- Date helpers (string-based → no timezone drift) ---------- */
const pad = n => String(n).padStart(2, "0");
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const isoAddDays = (iso, n) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};
const isoToDMY = iso => { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
function nightsBetween(a, b) {
  if (!a || !b) return 0;
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/* ---------- Booking URL builder ---------- */
function bookingUrl(roomId) {
  const loc = BOOKING.locales[LANG] || "es";
  const template = (roomId && BOOKING.rooms && BOOKING.rooms[roomId]) || BOOKING.base;
  let url = template.replace("{locale}", loc);
  if (!BOOKING.params) return url;
  const p = new URLSearchParams();
  if (stay.in)  p.set(BOOKING.params.checkin,  stay.in);
  if (stay.out) p.set(BOOKING.params.checkout, stay.out);
  if (stay.adults)   p.set(BOOKING.params.adults,   stay.adults);
  if (stay.children) p.set(BOOKING.params.children, stay.children);
  const qs = p.toString();
  return qs ? url + (url.includes("?") ? "&" : "?") + qs : url;
}

/* Shared stay state — the hero booking bar and every "Book" button read it. */
const stay = { in: null, out: null, adults: 2, children: 0 };

function refreshBookingLinks() {
  $$("[data-book]").forEach(a => { a.href = bookingUrl(a.dataset.book || null); });
}

/* ---------- Header scroll state ---------- */
const header = $("#siteHeader");
if (header && !header.classList.contains("is-solid")) {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Mobile nav ---------- */
const nav = $("#mainNav"), navToggle = $("#navToggle");
if (nav && navToggle) {
  const closeNav = () => {
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$("#mainNav a").forEach(a => a.addEventListener("click", closeNav));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });
}

/* ---------- Language menu ---------- */
const langBtn = $("#langBtn"), langMenu = $("#langMenu");
if (langBtn && langMenu) {
  langBtn.addEventListener("click", e => {
    e.stopPropagation();
    const open = langMenu.classList.toggle("open");
    langBtn.setAttribute("aria-expanded", String(open));
  });
  // Remember the visitor's explicit choice so the root page's auto-detect
  // redirect respects it on the next visit.
  $$("#langMenu a").forEach(a =>
    a.addEventListener("click", () => {
      if (a.dataset.lang) localStorage.setItem("bv_lang", a.dataset.lang);
    })
  );
  document.addEventListener("click", () => {
    langMenu.classList.remove("open");
    langBtn.setAttribute("aria-expanded", "false");
  });
}

/* ---------- Rooms and apartments ----------
   Two separate grids, because they are two different products: rooms are in
   the hostal itself, on the port, with daily housekeeping and the restaurant
   downstairs. The apartments are self-catering and elsewhere on the island —
   a guest booking one is not staying at the hostal at all. Mixing them in one
   list invites people to book the wrong thing. */
const roomsGrid = $("#roomsGrid");
const apartmentsGrid = $("#apartmentsGrid");
if ((roomsGrid || apartmentsGrid) && typeof ROOMS !== "undefined") {
  const icon = {
    guests: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4 0-9 2-9 5v3h18v-3c0-3-5-5-9-5Z"/></svg>',
    bed:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 7h2v6h14V9a3 3 0 0 0-3-3h-5v7H3V7Zm-1 8h20v5h-2v-2H4v2H2v-5Zm5-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/></svg>',
    size:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v2H5v6H3V3Zm18 18h-8v-2h6v-6h2v8Z"/></svg>',
    bath:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 11V5a2 2 0 1 1 4 0v1H6v2h14a1 1 0 0 1 1 1v2H4Zm-1 2h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2Z"/></svg>',
    view:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>'
  };

  ROOMS.forEach(room => {
    const target = room.type === "apartment" ? apartmentsGrid : roomsGrid;
    if (!target) return;
    const card = document.createElement("article");
    card.className = "room-card";

    const specs = [];
    if (room.guests) specs.push(`<li>${icon.guests}${room.guests} ${t(room.guests === 1 ? "room.guest" : "room.guests")}</li>`);
    if (room.beds)   specs.push(`<li>${icon.bed}${t("room.beds." + room.beds) || room.beds}</li>`);
    if (room.size)   specs.push(`<li>${icon.size}${room.size} m²</li>`);
    if (room.bath)   specs.push(`<li>${icon.bath}${t("room.bath." + room.bath)}</li>`);

    // Price is only rendered when the property has actually published one.
    const price = room.priceFrom
      ? `<div class="room-price">${t("room.from")}<strong>${room.priceFrom} €</strong>${t("room.perNight")}</div>`
      : `<div class="room-price is-todo"><strong>${t("room.priceOnRequest")}</strong></div>`;

    const tag = room.type === "apartment"
      ? `<span class="room-tag is-apartment">${t("room.tagApartment")}</span>`
      : `<span class="room-tag">${t("room.tagRoom")}</span>`;

    card.innerHTML =
      `<div class="room-media">${tag}` +
        `<img src="${ASSET_BASE}${room.img}" srcset="${srcsetFor(room.img, room.w)}"` +
        ` sizes="(max-width: 560px) 92vw, (max-width: 1000px) 46vw, 31vw"` +
        ` alt="${t("room." + room.id + ".alt") || ""}" loading="lazy" decoding="async"` +
        (room.w ? ` width="${room.w}"` : "") + (room.h ? ` height="${room.h}"` : "") + `>` +
      `</div>` +
      `<div class="room-body">` +
        `<h3>${t("room." + room.id + ".name")}</h3>` +
        (room.view ? `<p class="room-view">${icon.view}${t("room." + room.id + ".view")}</p>` : "") +
        `<p class="room-desc">${t("room." + room.id + ".desc")}</p>` +
        (specs.length ? `<ul class="room-specs">${specs.join("")}</ul>` : "") +
        `<div class="room-foot">${price}` +
          `<a class="btn btn-primary btn-sm" data-book="${room.id}" href="#" target="_blank" rel="noopener">${t("room.book")}</a>` +
        `</div>` +
      `</div>`;
    target.appendChild(card);
  });
}

/* ---------- Island guide ---------- */
const guideGrid = $("#guideGrid");
if (guideGrid && typeof GUIDE !== "undefined") {
  GUIDE.forEach(place => {
    const card = document.createElement("article");
    card.className = "guide-card";
    card.innerHTML =
      `<h3>${t("guide." + place.id + ".name")}</h3>` +
      `<span class="guide-dist">${place.dist}</span>` +
      `<p>${t("guide." + place.id + ".text")}</p>`;
    guideGrid.appendChild(card);
  });
}

/* ---------- FAQ ----------
   Native <details> elements: keyboard-accessible, searchable with the
   browser's own find-in-page, and they need no JavaScript to open. */
const faqList = $("#faqList");
if (faqList && typeof FAQ !== "undefined") {
  FAQ.forEach((item, i) => {
    const d = document.createElement("details");
    d.className = "faq-item";
    if (i === 0) d.open = true;
    d.innerHTML =
      `<summary>${t("faq." + item.id + ".q")}</summary>` +
      `<div class="faq-answer"><p>${t("faq." + item.id + ".a")}</p></div>`;
    faqList.appendChild(d);
  });
}

/* ---------- Restaurant menu (tabbed by course) ---------- */
const menuTabs = $("#menuTabs"), menuPanel = $("#menuPanel");
if (menuTabs && menuPanel && typeof MENU !== "undefined") {
  const renderCourse = key => {
    const course = MENU.find(c => c.id === key) || MENU[0];
    menuPanel.innerHTML = "<ul class='menu-list'>" + course.items.map(item => {
      const price = item.price
        ? `<span class="menu-price">${item.price} €</span>`
        : `<span class="menu-price is-todo">${t("menu.ask")}</span>`;
      const desc = t("menu." + item.id + ".desc");
      return `<li><span class="menu-dish"><strong>${t("menu." + item.id + ".name")}</strong>` +
             (desc && desc !== "menu." + item.id + ".desc" ? `<span>${desc}</span>` : "") +
             `</span>${price}</li>`;
    }).join("") + "</ul>";
  };

  MENU.forEach((course, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "menu-tab";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(i === 0));
    b.dataset.course = course.id;
    b.textContent = t("menu.course." + course.id);
    menuTabs.appendChild(b);
  });

  menuTabs.addEventListener("click", e => {
    const b = e.target.closest(".menu-tab");
    if (!b) return;
    $$(".menu-tab", menuTabs).forEach(x => x.setAttribute("aria-selected", String(x === b)));
    renderCourse(b.dataset.course);
  });

  if (MENU.length) renderCourse(MENU[0].id);
}

/* ---------- Gallery ---------- */
const grid = $("#galleryGrid");
if (grid && typeof GALLERY !== "undefined") {
  GALLERY.forEach((item, i) => {
    const fig = document.createElement("figure");
    fig.dataset.index = i;
    const img = document.createElement("img");
    img.src = ASSET_BASE + item.src;
    img.srcset = srcsetFor(item.src, item.w);
    img.sizes = "(max-width: 560px) 92vw, (max-width: 900px) 46vw, 24vw";
    img.loading = "lazy";
    img.decoding = "async";
    if (item.w) img.width = item.w;
    if (item.h) img.height = item.h;
    img.alt = t("gallery." + item.id) || "";
    fig.appendChild(img);
    grid.appendChild(fig);
  });

  /* Masonry: each tile is sized from its own aspect ratio and dropped into the
     currently-shortest column.
     Every tile keeps its photograph's true proportions — nothing is stretched
     or cropped to tidy the grid. That leaves the bottom edge slightly ragged,
     which is the honest trade: a panorama should look like a panorama, not be
     squared off to line up with the column beside it. */
  const GAL_ROW = 8, GAL_GAP = 14;
  function layoutGallery() {
    const figs = [...grid.children];
    if (!figs.length) return;
    const cs = getComputedStyle(grid);
    const cols = cs.gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    const colW = (grid.clientWidth - GAL_GAP * (cols - 1)) / cols;
    if (colW <= 0) return;                       // grid not laid out yet — try again later

    // Each tile's height in grid rows, straight from its photograph's ratio.
    const spans = figs.map(fig => {
      const item = GALLERY[+fig.dataset.index];
      const ratio = item && item.w && item.h ? item.h / item.w : 0.72;
      return Math.max(1, Math.round((colW * ratio + GAL_GAP) / (GAL_ROW + GAL_GAP)));
    });

    /* Balancing the columns.
       Filling left-to-right in array order leaves one column running far past
       the others, because whatever lands last is whatever is left. Instead:
       assign the TALLEST tiles first, each to whichever column is currently
       shortest (the classic longest-processing-time heuristic). The panoramas,
       being only a few rows deep, end up as the filler that levels everything
       off — so the columns finish within about a tile of each other.
       Then re-sort each column back into curated order, so reading down a
       column still follows the sequence in GALLERY. Nothing is stretched or
       cropped to achieve this; only the placement changes. */
    const byTallest = figs.map((_, i) => i).sort((a, b) => spans[b] - spans[a] || a - b);
    const colItems = Array.from({ length: cols }, () => []);
    const colHeight = new Array(cols).fill(0);
    for (const i of byTallest) {
      let c = 0;
      for (let k = 1; k < cols; k++) if (colHeight[k] < colHeight[c]) c = k;
      colItems[c].push(i);
      colHeight[c] += spans[i];
    }

    colItems.forEach((list, c) => {
      list.sort((a, b) => a - b);
      let row = 1;
      for (const i of list) {
        const fig = figs[i];
        fig.style.gridColumnStart = c + 1;
        fig.style.gridRowStart = row;
        fig.style.gridRowEnd = "span " + spans[i];
        row += spans[i];
      }
    });
  }
  layoutGallery();
  // Re-run once fonts and images have settled: the first pass can measure the
  // grid before the layout is final.
  window.addEventListener("load", layoutGallery);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutGallery);
  let galRAF;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(galRAF);
    galRAF = requestAnimationFrame(layoutGallery);
  });

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCaption");
  let lbIndex = 0, lastFocus = null;

  function openLb(i) {
    lbIndex = (i + GALLERY.length) % GALLERY.length;
    lbImg.src = ASSET_BASE + GALLERY[lbIndex].src;
    lbImg.alt = t("gallery." + GALLERY[lbIndex].id) || "";
    if (lbCap) lbCap.textContent = lbImg.alt;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("nav-open");
    $("#lbClose").focus();
  }
  function closeLb() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("nav-open");
    if (lastFocus) lastFocus.focus();
  }
  grid.addEventListener("click", e => {
    const fig = e.target.closest("figure");
    if (fig) { lastFocus = document.activeElement; openLb(+fig.dataset.index); }
  });
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", e => { e.stopPropagation(); openLb(lbIndex - 1); });
  $("#lbNext").addEventListener("click", e => { e.stopPropagation(); openLb(lbIndex + 1); });
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") openLb(lbIndex - 1);
    else if (e.key === "ArrowRight") openLb(lbIndex + 1);
  });
}

/* ---------- Booking bar: date picker ---------- */
const calEl = $("#calendar"), calGrid = $("#calGrid"), calTitle = $("#calTitle"),
      calWeekdays = $("#calWeekdays"), calMode = $("#calMode");
const inField = $("#bb-in"), outField = $("#bb-out");
let calRole = "in", calView = null;

function paintDates() {
  [["in", inField], ["out", outField]].forEach(([role, btn]) => {
    if (!btn) return;
    const span = btn.querySelector(".date-val");
    if (stay[role]) { span.textContent = isoToDMY(stay[role]); span.classList.remove("placeholder"); }
    else { span.textContent = t("book.pickDate"); span.classList.add("placeholder"); }
  });
  const badge = $("#nightsBadge");
  if (badge) {
    const n = nightsBetween(stay.in, stay.out);
    if (n > 0) { $("#nightsText").innerHTML = `<strong>${n}</strong> ${t(n === 1 ? "book.night" : "book.nights")}`; badge.hidden = false; }
    else badge.hidden = true;
  }
  refreshBookingLinks();
}

const minFor = role => role === "in" ? todayISO() : (stay.in ? isoAddDays(stay.in, 1) : isoAddDays(todayISO(), 1));

function positionPop(el, anchor) {
  const cont = $("#bookBar");
  if (!cont || !anchor) return;
  const maxLeft = Math.max(0, cont.clientWidth - el.offsetWidth);
  el.style.left = Math.min(anchor.offsetLeft, maxLeft) + "px";
  el.style.top = (anchor.offsetTop + anchor.offsetHeight + 6) + "px";
}

function renderCal() {
  if (!calView) return;
  calMode.textContent = t(calRole === "in" ? "book.checkin" : "book.checkout");
  calTitle.textContent = new Intl.DateTimeFormat(LANG, { month: "long", year: "numeric" }).format(new Date(calView.y, calView.m, 1));
  if (calWeekdays.dataset.lang !== LANG) {
    calWeekdays.innerHTML = "";
    const monday = new Date(2024, 0, 1);           // a Monday
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const s = document.createElement("span");
      s.textContent = new Intl.DateTimeFormat(LANG, { weekday: "short" }).format(d).replace(".", "");
      calWeekdays.appendChild(s);
    }
    calWeekdays.dataset.lang = LANG;
  }
  calGrid.innerHTML = "";
  const { y, m } = calView;
  const startDow = (new Date(y, m, 1).getDay() + 6) % 7;   // Monday-first
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const min = minFor(calRole), today = todayISO();
  for (let i = 0; i < startDow; i++) {
    const e = document.createElement("div"); e.className = "cal-day empty"; calGrid.appendChild(e);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${y}-${pad(m + 1)}-${pad(day)}`;
    const b = document.createElement("button");
    b.type = "button"; b.className = "cal-day"; b.textContent = day; b.dataset.iso = iso;
    if (iso < min) b.disabled = true;
    if (iso === today) b.classList.add("today");
    if (iso === stay.in || iso === stay.out) b.classList.add("selected");
    else if (stay.in && stay.out && iso > stay.in && iso < stay.out) b.classList.add("in-range");
    calGrid.appendChild(b);
  }
}

function openCal(role) {
  calRole = role;
  const base = (stay[role] || minFor(role)).split("-").map(Number);
  calView = { y: base[0], m: base[1] - 1 };
  renderCal();
  calEl.hidden = false;
  if (guestPop) guestPop.hidden = true;
  inField.classList.toggle("open", role === "in");
  outField.classList.toggle("open", role === "out");
  positionPop(calEl, role === "in" ? inField : outField);
}
function closeCal() {
  if (!calEl) return;
  calEl.hidden = true;
  inField.classList.remove("open");
  outField.classList.remove("open");
}

function selectDay(iso) {
  if (calRole === "in") {
    stay.in = iso;
    if (stay.out && stay.out <= iso) stay.out = null;   // drop a now-invalid check-out
    paintDates();
    calRole = "out";
    calView = { y: +iso.slice(0, 4), m: +iso.slice(5, 7) - 1 };
    renderCal();
    inField.classList.remove("open");
    outField.classList.add("open");
    positionPop(calEl, outField);                       // move under check-out so the switch reads clearly
  } else {
    stay.out = iso;
    paintDates();
    closeCal();
  }
}

if (inField && outField && calEl) {
  paintDates();
  const toggle = role => (!calEl.hidden && calRole === role) ? closeCal() : openCal(role);
  inField.addEventListener("click", e => { e.stopPropagation(); toggle("in"); });
  outField.addEventListener("click", e => { e.stopPropagation(); toggle("out"); });
  calEl.addEventListener("click", e => {
    e.stopPropagation();
    const navBtn = e.target.closest(".cal-nav");
    if (navBtn) {
      calView.m += +navBtn.dataset.cal;
      if (calView.m < 0) { calView.m = 11; calView.y--; }
      if (calView.m > 11) { calView.m = 0; calView.y++; }
      renderCal(); return;
    }
    const day = e.target.closest(".cal-day[data-iso]");
    if (day && !day.disabled) selectDay(day.dataset.iso);
  });
  document.addEventListener("click", () => { if (!calEl.hidden) closeCal(); });
}

/* ---------- Booking bar: guest picker ---------- */
const guestField = $("#bb-guests"), guestPop = $("#guestPop");
function paintGuests() {
  const label = $("#guestVal");
  if (label) {
    const total = stay.adults + stay.children;
    label.textContent = `${total} ${t(total === 1 ? "book.guest" : "book.guests")}`;
  }
  const a = $("#adultsVal"), c = $("#childrenVal");
  if (a) a.textContent = stay.adults;
  if (c) c.textContent = stay.children;
  $$(".step-btn").forEach(b => {
    const dir = +b.dataset.dir, step = b.dataset.step;
    b.disabled = dir < 0
      ? (step === "adults" ? stay.adults <= 1 : stay.children <= 0)
      : stay.adults + stay.children >= MAX_GUESTS;
  });
  refreshBookingLinks();
}

if (guestField && guestPop) {
  guestField.addEventListener("click", e => {
    e.stopPropagation();
    const willOpen = guestPop.hidden;
    guestPop.hidden = !willOpen;
    guestField.classList.toggle("open", willOpen);
    if (willOpen) { closeCal(); positionPop(guestPop, guestField); }
  });
  guestPop.addEventListener("click", e => {
    e.stopPropagation();
    const b = e.target.closest(".step-btn");
    if (!b || b.disabled) return;
    const dir = +b.dataset.dir;
    if (b.dataset.step === "adults") stay.adults = Math.max(1, stay.adults + dir);
    else stay.children = Math.max(0, stay.children + dir);
    paintGuests();
  });
  document.addEventListener("click", () => {
    guestPop.hidden = true;
    guestField.classList.remove("open");
  });
  paintGuests();
}

refreshBookingLinks();

/* ---------- Contact links ---------- */
$$("[data-contact]").forEach(el => {
  const kind = el.dataset.contact;
  const map = {
    phone:    "tel:" + CONTACT.phone,
    phone2:   "tel:" + CONTACT.phone2,
    email:    "mailto:" + CONTACT.email,
    whatsapp: CONTACT.whatsapp ? "https://wa.me/" + CONTACT.whatsapp : "",
    maps:     CONTACT.mapsUrl,
    facebook: CONTACT.facebook,
    instagram: CONTACT.instagram,
    tripadvisor: CONTACT.tripadvisorRestaurant
  };
  const href = map[kind];
  // An empty config value means "we don't have this channel" — hide the link
  // rather than shipping one that goes nowhere.
  if (href) el.href = href;
  else el.remove();
});

/* ---------- Enquiry form ---------- */
const form = $("#enquiryForm");
if (form) {
  // Return the guest to our own thank-you page, in their language, after
  // FormSubmit's captcha. Resolved against ASSET_BASE so it works on the
  // project URL and on the custom domain alike.
  const nextField = $("#cf-next");
  if (nextField) nextField.value = ASSET_BASE + "thanks/" + LANG + "/";

  // Mirror the booking-bar stay into the enquiry so both stay in sync.
  form.addEventListener("submit", e => {
    const status = $("#formStatus");
    const email = $("#cf-email");
    const consent = $("#cf-consent");
    let ok = true;

    [$("#cf-name"), email, $("#cf-message")].forEach(f => {
      if (!f) return;
      const bad = !f.value.trim();
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add("invalid"); ok = false;
    }
    if (consent && !consent.checked) ok = false;

    if (!ok) {
      e.preventDefault();
      if (status) { status.textContent = t("form.error"); status.className = "form-status err"; }
      return;
    }
    // Carry the chosen dates/guests through to the email body.
    const set = (id, val) => { const el = $(id); if (el) el.value = val; };
    set("#hCheckin",  isoToDMY(stay.in));
    set("#hCheckout", isoToDMY(stay.out));
    set("#hNights",   nightsBetween(stay.in, stay.out) || "");
    set("#hGuests",   `${stay.adults} ${t("book.adults")}, ${stay.children} ${t("book.children")}`);
    if (status) { status.textContent = t("form.sending"); status.className = "form-status ok"; }
  });
}

/* ---------- Init ---------- */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
