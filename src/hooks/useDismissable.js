import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Shared behaviour for the two overlays (reservation modal, order drawer):
 * Escape closes, the page behind stops scrolling, focus moves in on open and
 * back to the trigger on close, and Tab stays inside.
 *
 * Returns a ref to put on the panel element.
 */
export function useDismissable(open, onClose) {
  const panel = useRef(null)
  const restoreTo = useRef(null)

  useEffect(() => {
    if (!open) return

    restoreTo.current = document.activeElement
    // Locking the body rather than the html element keeps the scrollbar
    // gutter, so the page behind doesn't jolt sideways as the panel opens.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    panel.current?.querySelector(FOCUSABLE)?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel.current) return

      const items = [...panel.current.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreTo.current?.focus?.()
    }
  }, [open, onClose])

  return panel
}
