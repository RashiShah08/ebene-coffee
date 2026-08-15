import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

const canTransition =
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Pin `anchor` where it is on screen across a layout change.
 *
 * Filtering can remove two thirds of the grid, and Chrome's scroll anchoring
 * responds by scrolling to hold some node it picked steady — which drags the
 * page under you by however much the grid shrank. Measuring the element the
 * reader is actually using as a reference (the filter bar they just clicked)
 * and putting it back is the only way to keep the view still.
 */
function keepInPlace(anchor, update) {
  if (!anchor) return update()
  const before = anchor.getBoundingClientRect().top
  update()
  const drift = anchor.getBoundingClientRect().top - before
  // 'instant' because the document sets scroll-behavior:smooth — a smooth
  // correction would animate the very jump we are cancelling.
  if (Math.abs(drift) > 0.5) window.scrollTo({ top: window.scrollY + drift, behavior: 'instant' })
}

/**
 * Runs a state update inside a view transition, so the browser tweens the
 * before and after frames itself: cards that survive the filter glide to their
 * new grid position, cards that leave fade out, cards that arrive fade in.
 *
 * `flushSync` is required — the transition callback has to leave the DOM in
 * its final state before it returns, or React would batch the update until
 * after the snapshot was taken and nothing would animate.
 *
 * Returns [run, pending]. `pending` drives a plain crossfade on browsers
 * without the API (Firefox, older Safari) so the change is still soft there.
 */
export function useSmoothUpdate(duration = 260) {
  const [pending, setPending] = useState(false)
  const timer = useRef(null)

  const run = useCallback(
    (update, anchor) => {
      const apply = () => keepInPlace(anchor, () => flushSync(update))

      if (canTransition) {
        // Corrected inside the callback, so the scroll fix lands before the
        // browser takes its "after" snapshot.
        document.startViewTransition(apply)
        return
      }

      setPending(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        apply()
        setPending(false)
      }, duration / 2)
    },
    [duration],
  )

  return [run, pending]
}
