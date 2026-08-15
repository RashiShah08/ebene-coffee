import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
// WebP, resized to what the layout actually renders — the source PNGs were
// 7.5MB between them, which is more than the rest of the site put together.
import heroImage from './assets/obsidian-hero.webp'

/**
 * Every drink photograph, keyed by its `img` basename. Globbing beats fourteen
 * import lines, and `eager` keeps them in the normal asset graph so Vite still
 * hashes and fingerprints each file.
 */
const DRINK_IMAGES = Object.fromEntries(
  Object.entries(
    import.meta.glob('./assets/*.webp', { eager: true, query: '?url', import: 'default' }),
  ).map(([path, url]) => [path.replace('./assets/', '').replace('.webp', ''), url]),
)

// three.js is the bulk of the bundle and drives one decorative flourish, so it
// loads on its own after the page is already on screen.
const CoffeeOrbit = lazy(() => import('./components/CoffeeOrbit'))
import { useDismissable } from './hooks/useDismissable'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useSmoothUpdate } from './hooks/useSmoothUpdate'
import { SiteNav } from './components/SiteNav'
import { OriginStudio } from './components/OriginStudio'
import { VisitSection } from './components/VisitSection'
import { CATEGORIES, DRINKS, ORIGINS } from './menu'
import { addLine, inr, setQty, totals } from './cart'

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(({ id, label }) => [id, label]))

/* ---------------------------------------------------------------- overlays */

function ReservationModal({ onClose, onConfirm }) {
  const panel = useDismissable(true, onClose)
  // Today, in the local timezone — toISOString() would roll back a day for
  // anyone east of UTC, which is everyone this shop serves.
  const today = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 10)
  }, [])

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="reservation-modal"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserve-title"
        onSubmit={onConfirm}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="kicker">Reserve your ritual</p>
        <h2 id="reserve-title">A table for you.</h2>

        <label>
          Name
          <input required placeholder="Your name" autoComplete="name" />
        </label>
        <label>
          Email
          <input required type="email" placeholder="you@email.com" autoComplete="email" />
        </label>
        <div className="form-row">
          <label>
            Guests
            <select defaultValue="2">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5+</option>
            </select>
          </label>
          <label>
            Date
            <input required type="date" min={today} defaultValue={today} />
          </label>
        </div>

        <button className="button button-light" type="submit">
          Confirm request <i>↗</i>
        </button>
      </form>
    </div>
  )
}

function CartPanel({ cart, onClose, onQty, onCheckout }) {
  const panel = useDismissable(true, onClose)
  const { count, subtotal } = totals(cart)

  return (
    <>
      <div className="cart-scrim" onMouseDown={onClose} />
      <aside className="cart-panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <button className="modal-close" onClick={onClose} aria-label="Close order">
          ×
        </button>
        <p className="kicker">Your coffee order</p>
        <h2 id="cart-title">The good stuff.</h2>

        {cart.length ? (
          <>
            <div className="cart-items">
              {cart.map((line) => (
                <div className="cart-line" key={line.key}>
                  <div>
                    <span>{line.name}</span>
                    {line.detail && <em>{line.detail}</em>}
                  </div>
                  <b>{inr(line.unit * line.qty)}</b>
                  <div className="qty" role="group" aria-label={`Quantity for ${line.name}`}>
                    <button onClick={() => onQty(line.key, line.qty - 1)} aria-label={`One fewer ${line.name}`}>
                      −
                    </button>
                    <span aria-live="polite">{line.qty}</span>
                    <button onClick={() => onQty(line.key, line.qty + 1)} aria-label={`One more ${line.name}`}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <span>
                {count} {count === 1 ? 'drink' : 'drinks'}
              </span>
              <b>{inr(subtotal)}</b>
            </div>
            <button className="button button-light cart-checkout" onClick={onCheckout}>
              Place the order <i>↗</i>
            </button>
          </>
        ) : (
          <p className="empty-cart">Your coffee ritual starts here. Add something from the menu.</p>
        )}
      </aside>
    </>
  )
}

/* --------------------------------------------------------------------- app */

export default function App() {
  const [notice, setNotice] = useState('')
  const [cart, setCart] = useState([])
  const [reservationOpen, setReservationOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [category, setCategory] = useState('all')

  // There is no room for the bean cluster beside the hero copy on a phone, and
  // a decorative WebGL context is not worth a phone's battery. Not rendering it
  // beats hiding it in CSS, which would still spin up the renderer.
  const narrow = useMediaQuery('(max-width: 760px)')
  const [smoothly, filtering] = useSmoothUpdate()
  // The bar the reader just clicked is the thing that must not move.
  const filterBar = useRef(null)


  const { count } = totals(cart)

  // One timer, cleared on every new notice — otherwise two quick adds leave the
  // first timeout alive and it wipes the second message early.
  const noticeTimer = useRef(null)
  const notify = useCallback((message) => {
    clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = setTimeout(() => setNotice(''), 4200)
  }, [])
  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  const addDrink = useCallback(
    (line) => {
      setCart((items) => addLine(items, line))
      notify(`${line.name} has been added to your order.`)
    },
    [notify],
  )

  const addFromMenu = (drink) =>
    addDrink({ name: drink.name, detail: `${drink.notes} · ${drink.size}`, unit: drink.price })

  const visible = category === 'all' ? DRINKS : DRINKS.filter((d) => d.cat === category)

  // Menu adds carry no size or milk, so their cart key is just the drink name
  // — see lineKey() in cart.js.
  const qtyOf = (drink) => cart.find((line) => line.key === drink.name)?.qty ?? 0

  const closeCart = useCallback(() => setCartOpen(false), [])
  const closeReservation = useCallback(() => setReservationOpen(false), [])

  const reserve = (event) => {
    event.preventDefault()
    setReservationOpen(false)
    notify('Your table request is confirmed. We will be in touch shortly.')
  }

  const checkout = () => {
    setCart([])
    setCartOpen(false)
    notify('Order received. Your coffee will be ready soon.')
  }

  return (
    <main>
      <SiteNav count={count} onOpenCart={() => setCartOpen(true)} onOpenReserve={() => setReservationOpen(true)} />

      <section className="hero" id="top">
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />
        <div className="floating-bean bean-one" aria-hidden="true">✦</div>
        <div className="floating-bean bean-two" aria-hidden="true">✦</div>
        {!narrow && (
          <Suspense fallback={null}>
            <CoffeeOrbit />
          </Suspense>
        )}

        <div className="hero-copy">
          <p className="kicker">Est. 2024 · Bengaluru</p>
          <h1>
            For the<br />
            <em>unhurried</em><br />
            hours.
          </h1>
          <p className="hero-intro">
            A sanctuary for slow mornings, long conversations, and coffee treated as a beautiful daily ritual.
          </p>
          <div className="hero-actions">
            <a className="button button-filled" href="#menu">
              Discover the menu <i>↓</i>
            </a>
            <a className="text-link" href="#visit">
              Find us <i>↗</i>
            </a>
          </div>
        </div>

        <div className="hero-art">
          <img src={heroImage} alt="An espresso martini and demitasse on marble in a low-lit coffee bar" />
          <p>01 / A different kind of daily</p>
        </div>

        <div className="hero-foot">
          <span>Scroll to linger</span>
          <b />
          <span>Open daily · 8am–10pm</span>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div>
          {Array.from({ length: 2 }, (_, i) => (
            <span className="ticker-run" key={i}>
              <span>Single origin coffee</span><b>✦</b>
              <span>Slow mornings</span><b>✦</b>
              <span>Small batch roasting</span><b>✦</b>
              <span>Roasted in Bengaluru</span><b>✦</b>
            </span>
          ))}
        </div>
      </div>

      <section className="manifesto reveal" id="ritual">
        <p className="kicker">The Ébène philosophy</p>
        <h2>
          We make space for <em>the pause.</em>
        </h2>
        <div className="manifesto-grid">
          <p>
            Here, coffee is neither a quick fix nor a background thought. It is an invitation to be fully present.
          </p>
          <p>
            From considered beans to the weight of the cup in your hand, every small detail is chosen to make your time
            feel beautifully yours.
          </p>
        </div>
      </section>

      <OriginStudio images={DRINK_IMAGES} onAdd={addFromMenu} />

      <section className="menu-section reveal" id="menu">
        <div className="menu-header">
          <div>
            <p className="kicker">The coffee counter</p>
            <h2>
              Made with<br />
              <em>intention.</em>
            </h2>
          </div>
          <p>
            Fourteen ways in, all pulled from the same week-old roast. Thoughtful classics, a few subtle surprises, and
            whatever the season is giving us.
          </p>
        </div>

        <div className="menu-filter" role="group" aria-label="Filter the menu" ref={filterBar}>
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              className={category === id ? 'selected' : ''}
              aria-pressed={category === id}
              onClick={() => smoothly(() => setCategory(id), filterBar.current)}
            >
              {label}
              <b>{id === 'all' ? DRINKS.length : DRINKS.filter((d) => d.cat === id).length}</b>
            </button>
          ))}
        </div>

        <div className="menu-grid" data-filtering={filtering || undefined}>
          {visible.map((drink) => {
            const qty = qtyOf(drink)
            return (
              <article
                className={`coffee-card${qty ? ' in-cart' : ''}`}
                key={drink.no}
                // A stable, unique name lets the browser pair this card up
                // across the filter change and tween its position.
                style={{ viewTransitionName: `card-${drink.no.replace(/\D/g, '')}` }}
              >
                <div className="card-image">
                  <img src={DRINK_IMAGES[drink.img]} alt={drink.name} loading="lazy" width="900" height="1125" />
                  <span className="card-tag">{CATEGORY_LABEL[drink.cat]}</span>
                  {qty > 0 && <span className="card-count" aria-hidden="true">{qty} in order</span>}
                </div>

                <div className="card-body">
                  <div className="card-head">
                    <h3>{drink.name}</h3>
                    <strong>{inr(drink.price)}</strong>
                  </div>

                  {/* The tasting notes are already written as "a · b · c", so
                      they split straight into chips — no second copy of the
                      flavour text to keep in sync. */}
                  <ul className="card-notes">
                    {drink.notes.split('·').map((note) => (
                      <li key={note}>{note.trim()}</li>
                    ))}
                  </ul>

                  <div className="card-foot">
                    <span>{drink.size}</span>

                    {/* The add button becomes the stepper in place once the
                        drink is in the order, so the control never moves and
                        the count is readable without opening the drawer. */}
                    {qty === 0 ? (
                      <button className="card-add" onClick={() => addFromMenu(drink)}>
                        Add <i>+</i>
                      </button>
                    ) : (
                      <div className="card-qty" role="group" aria-label={`Quantity for ${drink.name}`}>
                        <button
                          onClick={() => setCart((items) => setQty(items, drink.name, qty - 1))}
                          aria-label={`One fewer ${drink.name}`}
                        >
                          −
                        </button>
                        <span aria-live="polite">{qty}</span>
                        <button
                          onClick={() => setCart((items) => setQty(items, drink.name, qty + 1))}
                          aria-label={`One more ${drink.name}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <VisitSection onReserve={() => setReservationOpen(true)} />

      <section className="press-strip">
        <p>“A little bit of old-world ceremony in the heart of the city.”</p>
        <span>— The City Edit</span>
        <div className="press-ornament" aria-hidden="true">✦</div>
      </section>

      <footer>
        <div className="footer-brand">
          <span>É</span> ÉBÈNE
        </div>
        <p>
          12 Church Street, Bengaluru<br />
          Karnataka 560001
        </p>
        <p>
          <a href="mailto:hello@ebenecoffee.in">hello@ebenecoffee.in</a><br />
          <a href="tel:+918040002100">+91 80 4000 2100</a>
        </p>
        <p className="footer-note">
          A house for coffee &<br />
          the art of taking time.
        </p>
      </footer>

      {reservationOpen && <ReservationModal onClose={closeReservation} onConfirm={reserve} />}
      {cartOpen && (
        <CartPanel
          cart={cart}
          onClose={closeCart}
          onQty={(key, qty) => setCart((items) => setQty(items, key, qty))}
          onCheckout={checkout}
        />
      )}

      <div className="toast-region" role="status" aria-live="polite">
        {notice && <div className="toast">{notice}</div>}
      </div>
    </main>
  )
}
