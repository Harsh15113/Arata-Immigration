# Arata Immigration — Website

A simple static website (plain HTML/CSS/JS, no build step) for Arata Immigration, Surat.

## Pages
- `index.html` — Home
- `services.html` — Visa/PR/citizenship + travel services, countries served
- `countries.html` — Hub page listing all 8 countries with flags
- `canada.html`, `usa.html`, `uk.html`, `germany.html`, `europe.html`, `uae.html`, `australia.html`, `new-zealand.html` — Per-country visa types + PR/immigration pathway programs
- `about.html` — About Achal Shah / Arata Immigration
- `gallery.html` — Office photo gallery
- `contact.html` — Contact info, map, inquiry form

## Navigation
The header has two hover mega-menus (tap-to-expand accordion on mobile):
- **Services** — links to each visa type's section on `services.html` (via anchor IDs like `#study-visa`)
- **Countries** — flag + name for all 8 countries, linking to their dedicated pages

Flag icons live in `assets/flags/` (one SVG per country, e.g. `ca.svg`, `us.svg`) — used only in the nav dropdown and the countries hub cards.

Each country page's hero banner uses a real skyline photo instead of a flag: `assets/photos/{ca,us,uk,de,eu,ae,au,nz}.jpg`. To update one, just overwrite the matching file (same name) and it updates automatically — no HTML changes needed.

## Preview locally
Just double-click `index.html`, or for a nicer local server:
```
cd arata-immigration-website
npx serve .
```

## 1. Logo — done
`assets/logo-icon.png` is the real Arata Immigration icon, cropped from the business card. It's wired into the header, footer and browser-tab favicon on every page. If you get a higher-resolution or vector version of the logo later, just overwrite `assets/logo-icon.png` with the new file (same filename) and every page updates automatically.

## 2. Gallery photos — done
The Gallery page displays photos as plain image cards (no captions), zooming slightly on hover. `assets/gallery/` has 4 real office photos (consultation room, meeting room from two angles, lounge/workstation area). To add more later, drop the image into `assets/gallery/` and copy one of the `.gallery-card` blocks in `gallery.html`, updating the `src` and `alt`.

The About page photo (`assets/photos` section on `about.html`) reuses `assets/gallery/consultation-room.jpg`. Swap that file (or point the `<img src>` on `about.html` at a different one) if you'd like a different photo there.

## 3. Connect the inquiry form (contact.html) to email
The form is pre-wired for **Netlify Forms**, which requires zero backend code — it only works once the site is deployed on Netlify (free tier is fine):
1. Deploy the site to Netlify (see below).
2. In the Netlify dashboard → your site → **Forms** → the "inquiry" form will appear automatically after the first deploy.
3. Go to **Site settings → Forms → Form notifications** → add email notifications to:
   - `Arataimmigration@gmail.com`
   - `Travel.arataimmigration@gmail.com`

If you deploy somewhere other than Netlify (Vercel, GitHub Pages, etc.), Netlify Forms won't work — instead sign up for a free form backend like [Formspree](https://formspree.io) and change the `<form>` tag's `action` and `method` per their instructions. Until either is set up, visitors can still use the "email us directly" link on the Contact page, which opens their email client addressed to both inboxes.

## 4. Deploy
Easiest free option — **Netlify**:
1. Create a free account at netlify.com.
2. Drag-and-drop the `arata-immigration-website` folder onto the Netlify dashboard, or connect a GitHub repo.
3. Netlify gives you a live URL immediately (e.g. `arata-immigration.netlify.app`); you can later connect a custom domain (e.g. `arataimmigration.com`) from Site settings → Domain management.

Alternatives: Vercel, GitHub Pages, or any standard web host (just upload all the files).

## 5. Hero globe (Home page)
The homepage hero now has an interactive 3D globe as its background (`js/globe.js`), built with **amCharts 5** loaded from their CDN (`cdn.amcharts.com`) — see the `<script>` tags near the bottom of `index.html`. It auto-rotates once every 30 seconds, and pauses while a visitor drags it, scrolls/zooms on it, or uses the "Rotate globe" slider beneath the hero card.

**Two things to know:**
- **Requires internet access** to load the amCharts CDN scripts. If they fail to load (offline, ad-blocker, restricted network), `globe.js` detects this and silently does nothing — the hero still looks fine with just its plain gradient background, no errors.
- **amCharts 5 free-tier license**: amCharts is free for non-commercial use; commercial sites are expected to either display the small "amCharts" attribution link the library shows by default, or purchase a commercial license to remove it. I have not removed that attribution — if you want it gone, you'll need an amCharts license (see [amcharts.com/online-store](https://www.amcharts.com/online-store/)).

## Notes
- WhatsApp button links to **+91 92747 30321** with a pre-filled generic inquiry message.
- Business card phone (+91 94261 50321) was not used per your instruction to standardize on the WhatsApp number.
- Instagram link points to `https://www.instagram.com/arataimmigration/`.
- Google Maps embed on the Contact page is a no-API-key link built from the office address; it works out of the box.
