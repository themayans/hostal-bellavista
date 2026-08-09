# Handover checklist

Everything on this site is either taken from the property's own material or
clearly marked as unknown. **Nothing has been invented.** This file lists every
place where a real value is still needed, roughly in order of how much it costs
you to leave it wrong.

---

## 1. Blockers — the site should not be advertised until these are done

### 1.1 Activate the enquiry form
The form posts to FormSubmit. **The first submission triggers a one-time
confirmation email to `reservas@hostal-bellavista.com` — somebody must click
that link, once.** Until then, no enquiry reaches anyone.

Send a test enquiry yourself, click the link in the resulting email, then send a
second test and confirm it arrives.

To keep the address out of the page source, replace it in the form `action`
(`_src/home.html`) with the random alias FormSubmit gives you after activation,
then run `npm run build`.

### 1.2 Verify the booking deep links
`BOOKING` in `js/main.js` builds Amenitiz URLs like:

```
https://hostal-bellavista.amenitiz.io/en/booking/room?checkin=2026-08-20&checkout=2026-08-23&adults=2
```

**Locales are verified**: the engine serves `es`, `en` and `it`; `de`, `ca` and
`fr` silently redirect to Spanish, so German and Catalan guests are sent
straight to `/es/` rather than through a pointless hop.

**Date pre-fill is NOT verified.** Pick dates on the homepage, press "Check
availability", and see whether Amenitiz arrives pre-filled.

- If it does — nothing to do.
- If the dates are ignored, adjust `BOOKING.params` to the names the engine
  actually uses (select dates in the engine and read its URL).
- If it errors on unknown parameters, set `params: null`; the buttons then link
  to the booking home page, which always works.

Note the property's own site does not pre-fill dates either — its booking widget
posts to an empty form action, i.e. it is broken there. So this is an
improvement over the status quo, not a regression, whichever way it lands.

**Per-room deep links do not exist** and `BOOKING.rooms` is deliberately empty.
Every room card links to the generic engine, which is exactly what the
property's own site does. If Amenitiz is later configured with per-room URLs,
add them there.

Finally: confirm with the owner that **Amenitiz, not Neobookings, is the
contracted engine.** The older `bellavista-formentera.com` site still sends
guests to Neobookings (property `XLqh6zoq7AC:BhAmC:ZL5Q`). Both are live right
now, which is a real risk of split bookings.

### 1.3 Resolve the legal identity — two sources disagree
The real details are now in `_src/legal-content.js` → `COMPANY`, taken from the
property's **own published privacy policy**, which states verbatim:

> Nuestra denominación: **HOSTAL BELLAVISTA CB** · Nuestro CIF / NIF: **E57315962**

Three things still need the owner:

1. **Which entity is the data controller.** The Amenitiz booking engine's legal
   page names a *different* titular — `FRANCISCO MAYANS TUR`, with no NIF —
   while the privacy PDF names `HOSTAL BELLAVISTA CB`. Probably a comunero of
   the same comunidad de bienes, but the legal pages must name the right one.
2. **The canonical postal address.** All three sources differ: the current site
   says `Polígon de la Marina, 8` (what we use); the privacy PDF says `Puerto la
   Savina, 8 oaseo la marina`; Amenitiz says `PASEO DE LA MARINA 8`.
3. **The Registro de Turismo number.** Legally required in the Illes Balears and
   blank in every source. It is a placeholder in `COMPANY.registry`.

> The property's existing privacy and cookie PDFs are in poor shape and should
> be retired, not linked: the address field is corrupted, the literal string
> `undefined` appears throughout, the cookie table is empty with the template's
> own instructions left visible to the public (*"Nota: el cliente debe
> cumplimentar la presente tabla…"*), and the text still cites the pre-2018
> data-protection authority name, URL and phone number.

### 1.4 Have the legal pages reviewed
The privacy policy, cookie policy and *aviso legal* are **drafts written to close
a real compliance gap** — the old site had none at all, and its cookie banner's
"Read more" link went nowhere. They are not legal advice and have not been
reviewed by a lawyer.

Every legal page currently shows a visible amber "draft" banner. Once a lawyer
or gestoría has approved the texts, set `DRAFT = false` in
`_src/legal-content.js` and run `npm run build` to remove it.

---

## 2. Facts the property has never published

None of these appear on either of the old websites, so the site says "ask us"
rather than guessing. Each is a booking you are probably losing.

| Fact | Where to put it (`js/i18n.js`, all 5 languages) |
| --- | --- |
| Check-in time | `contact.checkinV` |
| Check-out time | `contact.checkoutV` |
| Season — when do you open and close? | `contact.seasonV`, `restaurant.seasonTime` |
| Restaurant opening hours | `restaurant.hoursTime` |
| Pets allowed? | `contact.petsV` |
| Room rates ("from €X") | add `priceFrom: 95` to the relevant entry in `ROOMS` |
| Menu prices | add `price: 24` to the relevant entry in `MENU` |
| Cancellation policy | not yet on the site — worth adding a row to the info card |

**Seasonal opening matters most.** Formentera is highly seasonal and a guest who
cannot tell whether you are open in April will book elsewhere.

These were checked against **both** old sites and are genuinely absent from
each — this is not an oversight in the migration. The current site's CMS even
has empty fields waiting for them (`Desde` / `por noche` / `Ocupación máxima`
are defined but bound to nothing, and one room page still carries the developer
comment `<!--TODO: programar ocupaciones-->`). Its `/es/ofertas/` page renders
zero offers.

Two things on the old sites that were **deliberately not migrated**, because
they are demo content rather than fact:

- A *"Concierto Sábado Noche · 25 €"* event on the current homepage. It is
  hardcoded four times, every image is a `via.placeholder.com` grey box, every
  link is empty, and the date is `04/05/2020`. There is no real events programme.
- Four *"Tu hotel en Mallorca"* blocks describing an infinity pool, cocktail
  bar, solarium, Balinese beds and outdoor yoga. None of that exists at the
  property — it is the web agency's Mallorca demo text, currently live and
  public on the property's own site.

### Room rates and schema.org
Once you have "from" prices, they appear on the room cards *and* make the
`Hotel` structured data eligible for richer Google results. Until then the cards
honestly say "Price on request".

---

## 3. Photography

Two shoots were merged, and which one wins where matters:

- **Room, restaurant-terrace and the best marina photographs** come from the
  property's **current** shoot (1300–1800 px, professional, on the
  `hostal-bellavista.com` CMS). The rooms have clearly been **refurbished**
  since 2015 — the current photos show pale wood, sage and white; the 2015 ones
  show blue floral bedspreads and dated fittings. Publishing the old ones would
  have shown guests *worse* rooms than they will actually get.
- **Exteriors and the signature dishes** come from the 2015 shoot, which is
  still accurate and has no modern equivalent.

The hero is still a 2015 exterior at 1280 px — acceptable, but soft on a large
display. Worth commissioning: a hero of the building from the pontoon at golden
hour, at 2560 px for retina screens.

### ⚠ The apartment photos are wrong
The old site illustrated its three off-site apartments (Can Loca, Can Peix 22,
Barbaroja) with **photographs of hostal bedrooms** — the files are literally
`201-2.jpg`, `208-4.jpg` and `213_-8.jpg`, the same room shoot used elsewhere on
the page. We carried them over so the cards are not empty, but they do not show
those apartments, and they are now the only *pre-refurbishment* images left on
the site.

Either get real photographs of the three apartments, or remove the apartment
cards from `ROOMS` in `js/i18n.js`. Showing a guest a picture of somewhere they
are not going to sleep is the kind of thing that produces a bad review.

Also confirm the three apartments are **still rented at all** — that content is
from 2015 and the newer site does not mention them.

---

## 4. Things worth deciding

### Reviews
There is deliberately **no ratings widget and no `aggregateRating` markup.**
TripAdvisor currently has the restaurant at about 4.5/5 but the hostal at about
3.0/5, ranked near the bottom in La Savina. Publishing a rating badge would
actively cost you bookings.

The restaurant is the stronger asset and the site is built to lead with it. If
the hostal rating improves, adding a reviews section is straightforward.

### ⚠ Social media — tell the owner about this one
Only Facebook is configured here. `CONTACT` in `js/main.js` has empty
`instagram` and `whatsapp` — **an empty value removes the link entirely** rather
than shipping a dead one, so fill them in if those channels exist. A WhatsApp
number in particular converts well for guests who are often mid-journey.

**Do not copy the social icons from `hostal-bellavista.com`.** On every page of
that site, the Instagram, Twitter and YouTube icons point at unrelated
third-party commerce domains:

| Icon | Actually links to |
| --- | --- |
| Instagram | `mlsplayershop.com` |
| Twitter | `collegebasketball-online.com` |
| YouTube | `collegeplayersshop.com` |

This is either an abandoned CMS field or a hijacked/expired-domain SEO link.
Either way the property is currently sending its own visitors to third-party
shops from every page, and should be told.

### Distances
The distances in the "Getting here" list are approximate and derived from the
island's geography, not measured. Only "3 km to Sant Francesc" came from the old
site. Worth a sanity check against Google Maps.

### Translations
Spanish and English are carefully written. **Italian, German and Catalan were
drafted for launch and should get a native read-through.** Italian matters most
commercially — Italians are Formentera's largest visitor market.

Note the old site's translations were no better: its plugin only ever translated
the homepage, and every other `/en/`, `/de/`, `/it/` page served Spanish body
text under an English menu.

---

## 5. After the old site is retired

1. Set up redirects from the old URLs to the new ones so the existing search
   rankings transfer. The mapping is one-to-one onto homepage anchors:
   `/hotel` → `#about`, `/alojamiento-economico-en-formentera` → `#rooms`,
   `/restaurante-bellavista-formentera` → `#restaurant`,
   `/galeria-bellavista-formentera` → `#gallery`,
   `/contacto-y-ubicacion` → `#contact`,
   `/servicios-hotel-bellavista-formentera` → `#services`.
2. Kill the Lorem Ipsum pages. `/prueba-home` and thirteen `/portfolio/*` pages
   are publicly reachable **and listed in the old XML sitemap**, so Google can
   index them today.
3. Decide what happens to `hostal-bellavista.com`. Running two sites splits your
   SEO and confuses guests; point one at the other.
4. The old domain has **no working HTTPS** (its TLS handshake fails outright)
   and runs WordPress 4.2.39 — about ten years without a security patch, with
   XML-RPC exposed. Take it offline rather than leaving it running.

See **DOMAIN-CUTOVER.md** for moving this site onto `bellavista-formentera.com`.
