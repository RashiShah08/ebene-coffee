import { useEffect, useState } from 'react'

/**
 * Everything the header needs from the scroll position, computed in one
 * rAF-throttled listener rather than three competing ones:
 *
 *   scrolled  — past the hero, so the glass can fade in
 *   progress  — 0..1 through the document, for the hairline
 *   active    — id of the section currently owning the viewport
 *
 * `ids` must be in document order; the reader is the last section whose top
 * has passed the reading line, which is what a person would call "where I am".
 */
export function useNavState(ids) {
  const [state, setState] = useState({ scrolled: false, progress: 0, active: ids[0] })

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      // A third of the way down: high enough that a section counts as "current"
      // as it settles into frame, low enough that it doesn't trigger early.
      const line = y + window.innerHeight * 0.34

      let active = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= line) active = id
      }
      // The last section is usually shorter than the reading line's reach, so
      // hitting the bottom should always mean the final link is lit.
      if (max > 0 && max - y < 4) active = ids[ids.length - 1]

      setState((prev) => {
        const next = {
          scrolled: y > 60,
          progress: max > 0 ? Math.min(1, y / max) : 0,
          active,
        }
        return prev.scrolled === next.scrolled && prev.active === next.active &&
          Math.abs(prev.progress - next.progress) < 0.002
          ? prev
          : next
      })
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return state
}
