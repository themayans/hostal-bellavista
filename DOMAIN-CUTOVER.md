# Moving the site to bellavista-formentera.com

The site currently lives at **https://themayans.github.io/hostal-bellavista/**.
This is how to serve it from the real domain instead.

It is written as two runbooks, because it usually takes two different people:
whoever controls the DNS, and whoever owns the GitHub repository. **Part A must
be finished before Part B**, or GitHub cannot issue the HTTPS certificate.

---

## Before you start

Decide which domain is canonical. There are currently **two live sites**:

- `bellavista-formentera.com` — the 2015 WordPress site. Older, but it holds the
  search rankings and the inbound links.
- `hostal-bellavista.com` — the newer Spanish-only site.

Whichever you choose, point the other one at it with a permanent (301)
redirect. Running both splits your search ranking and confuses guests.

These instructions assume **`bellavista-formentera.com`**, with `www` as the
primary hostname. If you pick the other domain, substitute it throughout.

---

# Part A — for whoever manages the DNS

You need access to the control panel of the company where the domain is
registered. You are adding five records. Nothing here touches email — **do not
remove or change any `MX` record**, or mail to `reservas@hostal-bellavista.com`
will stop.

### A1. Apex records (`bellavista-formentera.com`, no `www`)

Delete any existing `A` or `AAAA` records for the bare domain, then create four
`A` records, all with host/name `@` (some panels want the domain itself, or a
blank field):

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

### A2. The `www` record

Delete any existing `A`, `AAAA` or `CNAME` record for `www`, then create:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | www | themayans.github.io. |

Note the trailing dot on `themayans.github.io.` — some panels require it, some
add it for you. Never point `www` at an IP address.

### A3. Tell the GitHub owner you are done

DNS changes take anywhere from a few minutes to a few hours to propagate. To
check, run:

```bash
dig +short bellavista-formentera.com
dig +short www.bellavista-formentera.com
```

The first should list the four `185.199.*` addresses; the second should show
`themayans.github.io`. Once it does, hand over to Part B.

---

# Part B — for the GitHub repository owner

Do **not** start until Part A is verified, or the certificate request fails and
you have to wait and retry.

### B1. Commit the CNAME file

GitHub needs a file called `CNAME` in the repository root containing the
hostname. Casa Trini relies on the Pages settings UI alone for this, which is
easy to lose if the repo is ever re-created — committing the file is safer.

```bash
echo "www.bellavista-formentera.com" > CNAME
git add CNAME && git commit -m "Add CNAME for the custom domain" && git push
```

### B2. Point the build at the new domain

Three files carry the base path, plus the Jekyll config. Change all four:

| File | Change |
| --- | --- |
| `scripts/build-home.js` | `BASE = ""` and `DOMAIN = "https://www.bellavista-formentera.com"` |
| `scripts/build-legal.js` | same two constants |
| `scripts/build-misc.js` | same two constants |
| `scripts/serve.js` | `BASE = ""` (so local preview keeps matching production) |
| `_config.yml` | `url: "https://www.bellavista-formentera.com"` and `baseurl: ""` |

Then regenerate every page and push:

```bash
npm run build
git add -A && git commit -m "Domain cutover: serve at www.bellavista-formentera.com" && git push
```

This rewrites every canonical URL, every `hreflang` alternate, the Open Graph
URLs, the JSON-LD, `sitemap.xml`, `robots.txt` and `llms.txt` in one pass.

### B3. Set the domain in the repository settings

1. Go to **Settings → Pages** in `themayans/hostal-bellavista`.
2. Under **Custom domain**, enter `www.bellavista-formentera.com` and save.
3. GitHub runs a DNS check. If it fails, wait — propagation from Part A may not
   have reached GitHub yet — and press save again.
4. Wait for **"DNS check successful"**, then tick **Enforce HTTPS**.

The certificate can take up to about an hour to issue. Until it does, the site
may show a certificate warning. That is normal; do not undo anything.

### B4. Verify

```bash
curl -sI https://www.bellavista-formentera.com/            # expect 200
curl -sI https://bellavista-formentera.com/                # expect 301 → www
curl -s  https://www.bellavista-formentera.com/en/ | grep canonical
```

The canonical link should now read `https://www.bellavista-formentera.com/en/`.

Then check by eye: the five languages, a legal page, and that the booking
button still opens Amenitiz.

---

## Part C — retire the old sites

Once the new site is live on the domain, the old WordPress installation must be
taken down, not merely left running:

1. **Redirect the old URLs** so the search rankings transfer. The mapping onto
   the new homepage anchors:

   | Old path | New |
   | --- | --- |
   | `/hotel` | `/#about` |
   | `/alojamiento-economico-en-formentera` | `/#rooms` |
   | `/servicios-hotel-bellavista-formentera` | `/#services` |
   | `/restaurante-bellavista-formentera` | `/#restaurant` |
   | `/galeria-bellavista-formentera` | `/#gallery` |
   | `/actividades-en-formentera` | `/#location` |
   | `/contacto-y-ubicacion` | `/#contact` |

2. **Let the junk 404.** `/prueba-home` and the thirteen `/portfolio/*` pages
   are Lorem Ipsum theme demos that are currently public *and listed in the old
   XML sitemap*. Do not redirect them — return 404 or 410 so they drop out of
   the index.

3. **Take WordPress offline.** It is version 4.2.39, roughly ten years without a
   security patch, with XML-RPC exposed and no working HTTPS. Leaving it running
   on a subdomain "just in case" keeps that exposure. Take a backup, then shut
   it down.

4. **Decide what happens to `hostal-bellavista.com`** — redirect it to the
   canonical domain, and remember its footer currently links visitors to
   unrelated third-party shops (see HANDOVER.md).

---

## Rolling back

If something goes wrong, the site returns to the project URL by reversing B2 and
clearing the custom domain in Settings → Pages. The DNS records can stay; they
simply point at a domain GitHub is no longer serving.
