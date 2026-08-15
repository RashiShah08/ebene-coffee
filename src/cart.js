/** 260 → "₹260". One place, so money never renders two different ways. */
export const inr = (n) => `₹${n.toLocaleString('en-IN')}`

/**
 * Cart lines are keyed by what makes two orders genuinely different. A large
 * oat latte and a regular whole-milk latte are two rows; the same drink tapped
 * twice is one row with qty 2.
 */
const lineKey = (line) => [line.name, line.size, line.milk].filter(Boolean).join('|')

export function addLine(cart, line) {
  const key = lineKey(line)
  const found = cart.find((l) => l.key === key)
  if (found) return cart.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
  return [...cart, { ...line, key, qty: 1 }]
}

/** qty <= 0 removes the row, so one control does both decrement and delete. */
export const setQty = (cart, key, qty) =>
  qty <= 0 ? cart.filter((l) => l.key !== key) : cart.map((l) => (l.key === key ? { ...l, qty } : l))

export function totals(cart) {
  const count = cart.reduce((n, l) => n + l.qty, 0)
  const subtotal = cart.reduce((n, l) => n + l.unit * l.qty, 0)
  return { count, subtotal }
}
