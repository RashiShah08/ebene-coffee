# ÉBÈNE Coffee House

A single-page marketing and ordering site for a coffee house at 12 Church
Street, Bengaluru. Fourteen drinks you can add to an order, the three farms
behind them, and a map to the door.

Built with React and Vite. No UI framework, no CSS library, no state library.

---

## Contents

- [Quick start](#quick-start)
- [The page](#the-page)
- [Project structure](#project-structure)
- [Adding or changing a drink](#adding-or-changing-a-drink)
- [Architecture notes](#architecture-notes)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Testing](#testing)
- [Known limitations](#known-limitations)

---

## Quick start

**Requirements:** Node 18 or newer (developed on Node 24) and npm.

```bash
npm install
npm run dev       # development server, http://localhost:5173
npm run build     # production bundle → dist/
npm run preview   # serve the built bundle locally
```

`npm run dev` uses the next free port if 5173 is taken; Vite prints the actual
URL on start.

---

## The page

One scrolling page. The header links mirror the section order and are numbered
to match, so the navigation reads as a table of contents rather than a list.

| Section | Anchor | Contents |
| --- | --- | --- |
| Hero | `#top` | Wordmark, photograph, and a small WebGL bean cluster |
| Our ritual | `#ritual` | The house statement |
| Origins | `#origin` | Three farms as a spec sheet, each tied to the cup it becomes |
| The menu | `#menu` | 14 photographed cards, filterable, with in-card quantity steppers |
| Visit | `#visit` | Map, address, opening hours, reservation |
| Press | — | A pull quote |

Ordering is client-side only: adding a drink updates local state, the header
badge, and a toast. Checkout and the reservation form are demonstrations — they
validate and confirm, but post nowhere.

---

## Project structure

```
src/
├─ main.jsx                 Entry point. Stylesheet import order is load-bearing.
├─ App.jsx                  Page composition, cart state, toast, image map
├─ menu.js                  DRINKS, CATEGORIES, ORIGINS — all copy and prices
├─ cart.js                  Currency formatting and cart arithmetic
│
├─ components/
│  ├─ SiteNav.jsx           Fixed header: glass on scroll, scroll-spy, progress rule
│  ├─ OriginStudio.jsx      Origins: tab rail, spec sheet, resulting cup
│  ├─ VisitSection.jsx      Map alongside address, hours and actions
│  ├─ StreetMap.jsx         Google Maps embed, mounted on approach
│  └─ CoffeeOrbit.jsx       Hero WebGL — lazy-loaded, desktop only
│
├─ hooks/
│  ├─ useNavState.js        One rAF-throttled listener → scrolled / progress / active
│  ├─ useSmoothUpdate.js    View-transition filtering with scroll anchoring
│  ├─ useDismissable.js     Escape, scroll lock, focus trap, focus restore
│  └─ useMediaQuery.js      Subscribes to a media query
│
├─ styles/                  base → motion → functional → press → cards → origin → visit → nav
└─ assets/                  15 WebP photographs
```

### Stylesheet order is significant

`main.jsx` imports eight stylesheets, and later ones deliberately override
earlier ones — `nav.css` owns the header outright, `cards.css` owns the menu.
Reordering the imports changes the rendered page.

---

## Adding or changing a drink

Everything the menu renders comes from one entry in `src/menu.js`:

```js
{
  no: 'No. 07',
  name: 'Saffron Cortado',
  img: 'saffron-cortado',              // basename of the file in src/assets
  notes: 'Rose cardamom · steamed milk',
  size: '120 ml',
  price: 340,                          // whole rupees
  cat: 'espresso',                     // must match an id in CATEGORIES
}
```

Add a matching `saffron-cortado.webp` to `src/assets` and the card, the category
count and the filter all update. Two deliberate choices here:

- **The image key lives on the drink**, not in a separate name-to-file lookup,
  so renaming a drink cannot silently orphan its photograph.
- **Flavour chips are split from `notes` on `·`**, so there is no second copy of
  the flavour text to keep in sync.

Origins work the same way. Each entry's `becomes` field must match a
`DRINKS.name`; that is what pairs a farm with the cup it produces.

---

## Architecture notes

The decisions below are not obvious from reading the code, which is why they are
written down.

### Money is never parsed out of text

`cart.js` holds prices as numbers and `inr()` is the only function that formats
them. Cart lines are keyed by what genuinely distinguishes two orders, so the
same drink added twice becomes one row with `qty: 2` rather than two rows.

### three.js is lazy-loaded and desktop-only

The hero's bean cluster costs 875 kB — roughly five times the rest of the
application — for one decorative flourish. It is split into its own chunk via
`React.lazy`, loads after first paint, and is not rendered at all below 760 px.

### The map is a Google embed, mounted on approach

`StreetMap.jsx` mounts the iframe through an `IntersectionObserver` with a
600 px margin rather than relying on `loading="lazy"`, which did not fire
reliably in testing. Anyone who never scrolls to Visit pays nothing for Google's
cookies or scripts.

### Filtering animates through the View Transitions API

Each card carries a unique `view-transition-name`, so cards that survive a
filter change glide to their new grid position instead of the row being redrawn.
The state update runs inside `flushSync`: React batches by default, and without
it the DOM would not be in its final state when the browser takes its "after"
snapshot, so nothing would animate. Browsers without the API — currently
Firefox — receive a short crossfade instead.

### Filtering must not move the page

Narrowing from fourteen cards to two shortens the document by roughly 1,600 px.
Chrome's scroll anchoring reacts by scrolling to hold a node of its own
choosing, which drags the page out from under the reader. Two things prevent it:
the grid sets `overflow-anchor: none`, and `useSmoothUpdate` measures the filter
bar's screen position before the change and restores it afterwards. The
correction is applied with `behavior: 'instant'`, because the document sets
`scroll-behavior: smooth` and would otherwise animate the very jump being
cancelled.

### Photography ships at render size

Source masters were 27.6 MB of PNG. The shipped set is 15 WebP files totalling
1.1 MB, resized to what the layout actually renders. `sharp` is included as a
development dependency for regenerating them.

---

## Accessibility

- Both overlays — the order drawer and the reservation dialog — close on
  Escape, lock background scrolling, trap Tab within the panel, and return focus
  to the control that opened them.
- The origin selector is a genuine `tablist` with three `tab` controls and a
  linked `tabpanel`. The current navigation link carries `aria-current`.
- Quantity steppers name the drink they belong to, so "one more" is never
  ambiguous out of context.
- Decorative layers — the bean cluster, the travelling nav pill, the flavour
  meters — are `aria-hidden`, since the value beside a meter already states it.
- Every image has an `alt` attribute; the page has exactly one `h1`.
- All motion is disabled under `prefers-reduced-motion`, including the filter
  transition, which degrades to an instant swap.

---

## Performance

Production bundle, gzipped in brackets:

| Asset | Size |
| --- | --- |
| `index.js` | 168 kB (55 kB) |
| `index.css` | 33 kB (8 kB) |
| `CoffeeOrbit.js` | 875 kB (240 kB) — deferred, desktop only |
| 15 WebP photographs | 1.1 MB total, lazily loaded |

Card and map images load on demand, so a first view costs the initial bundle
plus the hero photograph.

---

## Testing

There is no unit-test runner. The site is verified end to end by driving a
headless Chrome over the DevTools Protocol against the **production build** at
1440 px, 1000 px and 414 px: rendering, all fourteen images, origin tab
switching, filtering and scroll stability, cart arithmetic, both overlays,
the mobile navigation, and the map — 61 assertions, plus zero console errors and
zero failed network requests at every viewport.

Two habits from building this are worth carrying forward:

- **Measure rather than eyeball.** "The screen moves when I filter" turned out
  to be Chrome's scroll anchoring rather than a layout fault, and that was only
  provable by logging scroll position against element position.
- **Do not trust a screenshot on its own.** A cross-origin iframe changes
  Chrome's compositing path, after which `Page.captureScreenshot` returns the
  top of the document regardless of scroll position. Capture in a fresh tab, and
  confirm scroll separately before believing an image.

---

## Known limitations

- **Ordering and reservations are not wired to a backend.** Both flows validate
  and confirm in the interface, then stop.
- **The Google Maps embed uses the keyless `output=embed` form.** A production
  deployment should use the official Maps Embed API with a key, and the Visit
  section requires network access to render.
- **Photography is shipped at display resolution.** The higher-resolution PNG
  masters are no longer in the repository, so images cannot be re-exported
  larger from here.
- **`removed-source-backup.zip`** holds an earlier, unused WebGL scroll build
  that was removed from `src/`. It predates this repository and is committed so
  that it stays recoverable; it can be deleted at any time and retrieved from
  history.
