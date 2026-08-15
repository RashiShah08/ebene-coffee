# ÉBÈNE Coffee House

A single-page site for a fictional coffee house at 12 Church Street, Bengaluru.
Fourteen drinks you can order, three farms behind them, and a map to the door.

React + Vite. No framework beyond that, no CSS library, no state library.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # serve the production build
```

---

## The page

| # | Section | id | What it does |
|---|---------|-----|--------------|
| — | Hero | `#top` | Wordmark, photograph, and a small WebGL bean cluster |
| 01 | Our ritual | `#ritual` | The manifesto |
| 02 | Origins | `#origin` | Three farms as a spec sheet, each linked to the cup it becomes |
| 03 | The menu | `#menu` | 14 photographed cards, filterable, with in-card quantity steppers |
| 04 | Visit | `#visit` | Google map, address, hours, reservation |
| — | Press | — | A pull quote |

The header links mirror that order and are numbered to match — it reads as a
table of contents rather than an arbitrary list.

---

## Structure

```
src/
├─ main.jsx                 entry; stylesheet order is load-bearing (see below)
├─ App.jsx                  page composition, cart state, toast
├─ menu.js                  DRINKS, CATEGORIES, ORIGINS — all copy and prices
├─ cart.js                  money formatting and cart maths
├─ components/
│  ├─ SiteNav.jsx           sticky glass header, scroll-spy, reading progress
│  ├─ OriginStudio.jsx      the beans: tab rail, spec sheet, cup
│  ├─ VisitSection.jsx      map + practical details
│  ├─ StreetMap.jsx         Google Maps embed, mounted on approach
│  └─ CoffeeOrbit.jsx       hero WebGL — lazy-loaded, desktop only
├─ hooks/
│  ├─ useNavState.js        one rAF listener → scrolled / progress / active
│  ├─ useSmoothUpdate.js    view-transition filtering + scroll anchoring
│  ├─ useDismissable.js     Escape, scroll lock, focus trap, focus restore
│  └─ useMediaQuery.js
├─ styles/                  base → motion → functional → press → cards → origin → visit → nav
└─ assets/                  15 WebP photographs
```

### Content lives in `menu.js`

Adding a drink is one entry — name, `img` basename, tasting notes, size, price,
category. Nothing else needs touching:

```js
{ no: 'No. 07', name: 'Saffron Cortado', img: 'saffron-cortado',
  notes: 'Rose cardamom · steamed milk', size: '120 ml', price: 340, cat: 'espresso' }
```

The `img` key lives on the drink rather than in a separate name→file lookup, so
renaming a drink can never silently orphan its photograph. Flavour chips are
split from `notes` on `·`, so there is no second copy of the flavour text.

---

## Decisions worth knowing

**Stylesheet order matters.** `main.jsx` imports eight sheets and later ones
deliberately override earlier ones — `nav.css` owns the header outright,
`cards.css` owns the menu. Reorder the imports and the page changes.

**Money is never parsed back out of text.** `cart.js` holds numbers; `inr()` is
the only thing that formats them. Cart lines are keyed by what makes two orders
genuinely different, so the same drink tapped twice is one row with `qty: 2`.

**three.js is lazy-loaded and desktop-only.** It is ~875 kB — five times the
rest of the app — for one decorative flourish in the hero. It loads after first
paint and is not rendered at all below 760px.

**The map is a Google embed, mounted on approach.** An `IntersectionObserver`
mounts the iframe about a screen early rather than using `loading="lazy"`, which
did not fire reliably. Nobody who never scrolls to Visit pays for Google's
cookies or ~1 MB of script.

**Filtering animates via the View Transitions API.** Each card carries a unique
`view-transition-name`, so surviving cards glide to their new grid slot instead
of the row redrawing. The state update runs inside `flushSync` — without it
React would batch past the browser's "after" snapshot and nothing would animate.
Firefox gets a crossfade instead.

**Filtering must not move the page.** Dropping from 14 cards to 2 shortens the
document by ~1,600 px, and Chrome's scroll anchoring responds by scrolling to
hold some node it picked — dragging the page out from under you. The grid sets
`overflow-anchor: none` and `useSmoothUpdate` pins the filter bar's exact screen
position across the change.

**Images are WebP at render size.** The masters were 27.6 MB of PNG; the shipped
set is 1.1 MB. Regenerate with `sharp` (a devDependency) if new photography
arrives — note the sources are no longer in the repo.

---

## Accessibility

- Both overlays close on Escape, lock background scroll, trap Tab, and return
  focus to whatever opened them.
- The origin tabs are a real `tablist`; the active nav link carries
  `aria-current`; quantity steppers announce which drink they belong to.
- Decorative layers — the bean cluster, the nav pill, the profile bars — are
  `aria-hidden`, since the number beside a bar already says what it says.
- Every animation is disabled under `prefers-reduced-motion`, including the
  filter transition, which falls back to an instant swap.

---

## Testing

There is no test runner. The site was verified by driving a headless Chrome over
the DevTools Protocol against the **production build** at 1440 / 1000 / 414 px:
rendering, all 14 images, origin tab switching, filtering and scroll stability,
the cart maths, both overlays, the mobile nav, and the map — 61 checks, plus
zero console errors and zero failed requests at every viewport.

Two habits that caught real bugs, worth keeping:

- **Measure, don't eyeball.** "The screen moves when I filter" turned out to be
  Chrome's scroll anchoring, not a layout bug — provable only by logging scroll
  position against element position.
- **Distrust a green screenshot.** A cross-origin iframe changes Chrome's
  compositing path, and `Page.captureScreenshot` starts returning the top of the
  document regardless of scroll. Capture in a fresh tab, and verify scroll
  separately before believing an image.

---

## Notes

- `removed-source-backup.zip` holds an earlier, unused WebGL scroll build that
  was deleted from `src/`. Delete it once you are sure you do not want it.
- The reservation form is a demo — it validates and shows a confirmation, but
  posts nowhere.
- The Google Maps embed is the keyless `output=embed` form. For production, use
  the official Maps Embed API with a key.
