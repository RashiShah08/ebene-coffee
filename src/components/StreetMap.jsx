import { useEffect, useRef, useState } from 'react'

/** Church Street, Bengaluru — between Brigade Road and St Marks Road. */
export const SHOP_QUERY = '12 Church Street, Bengaluru, Karnataka 560001'

const EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(SHOP_QUERY)}&z=17&hl=en&output=embed`

/**
 * Google Maps itself, embedded.
 *
 * Tiles rendered from the same OpenStreetMap data still don't read as "a map"
 * to anyone who has used a phone in the last decade — the Google treatment is
 * the one people recognise. So this is the real thing, not an imitation.
 *
 * The trade is control: the iframe can't be restyled and the pin is theirs.
 *
 * The frame is mounted only once the section is close to the viewport, rather
 * than relying on loading="lazy" — that keeps Google's cookies and ~1MB of
 * script off the page for anyone who never scrolls this far, and it behaves
 * the same everywhere instead of being left to the browser's discretion.
 */
export function StreetMap() {
  const holder = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const node = holder.current
    if (!node || mounted) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          observer.disconnect()
        }
      },
      // Start loading a screen early, so the map is drawn by the time the
      // section is actually reached.
      { rootMargin: '600px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [mounted])

  return (
    <div className="map-frame" ref={holder}>
      {mounted && (
        <iframe
          title="Google Map showing Ébène at 12 Church Street, Bengaluru"
          src={EMBED_SRC}
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen"
        />
      )}
    </div>
  )
}
