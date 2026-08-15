import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavState } from '../hooks/useNavState'

/**
 * Links in the order the page actually presents them, so the header reads as a
 * table of contents rather than an arbitrary list. The numbers are part of that
 * — they tell you how far through the room you are.
 */
export const NAV_LINKS = [
  { id: 'ritual', label: 'Our ritual' },
  { id: 'origin', label: 'Origins' },
  { id: 'menu', label: 'The menu' },
  { id: 'visit', label: 'Visit' },
]

const IDS = NAV_LINKS.map((link) => link.id)

export function SiteNav({ count, onOpenCart, onOpenReserve }) {
  const [open, setOpen] = useState(false)
  const { scrolled, progress, active } = useNavState(IDS)

  // The lit pill is one element that slides between links, rather than a
  // background on each link — the travel is the whole effect.
  const listRef = useRef(null)
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current
      const current = list?.querySelector('[data-active="true"]')
      if (!list || !current) return setPill((p) => ({ ...p, ready: false }))
      setPill({ left: current.offsetLeft, width: current.offsetWidth, ready: true })
    }
    measure()
    window.addEventListener('resize', measure)
    // Web fonts land after first paint and change every link's width, so the
    // pill is re-measured once the real faces are in.
    document.fonts?.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])

  // Close the mobile panel on Escape, to match the drawer and the modal.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <nav className={`site-nav${scrolled ? ' stuck' : ''}${open ? ' nav-open' : ''}`}>
      <a className="brand" href="#top" onClick={() => setOpen(false)} aria-label="ÉBÈNE home">
        <span>É</span>
        <span className="brand-word">
          <b>ÉBÈNE</b>
          <small>Coffee House</small>
        </span>
      </a>

      <div className="nav-links" id="nav-links" ref={listRef}>
        {/* Hidden from the reader: it is decoration that duplicates the
            aria-current already on the active link. */}
        <span
          className={`nav-pill${pill.ready ? ' on' : ''}`}
          style={{ '--pill-x': `${pill.left}px`, '--pill-w': `${pill.width}px` }}
          aria-hidden="true"
        />
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            data-active={active === link.id}
            aria-current={active === link.id ? 'true' : undefined}
            onClick={() => setOpen(false)}
          >
            <i>{String(i + 1).padStart(2, '0')}</i>
            {/* Two stacked copies: the first rides up out of the mask as the
                second rides in, so the label swaps rather than just fading. */}
            <span className="nav-label">
              <span>{link.label}</span>
              <span aria-hidden="true">{link.label}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="nav-actions">
        <button className="cart-button" onClick={onOpenCart}>
          Order <b>{count}</b>
        </button>
        <button className="nav-book" onClick={onOpenReserve}>
          Reserve a table <i>↗</i>
        </button>
        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <b />
          <b />
        </button>
      </div>

      {/* Reading progress. scaleX is compositor-only, so this costs nothing to
          animate on every frame. */}
      <span className="nav-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </nav>
  )
}
