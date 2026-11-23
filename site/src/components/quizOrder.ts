// The order in which a question's options are shown.
//
// Quiz files are written with the right answer wherever it reads naturally,
// which in practice was nearly always second. Showing them in a shuffled order
// stops the position from giving the answer away. The shuffle depends only on
// the question's text, so a question looks the same every time it is opened.

function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function random(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STAYS_LAST = /^(all|none|both) of (the|these)\b/i
/** A list of short numbers, such as "99%", "50%", "13%", reads best in the order it was written. */
const isScale = (options: string[]) => options.every((o) => o.length <= 14 && /\d/.test(o))

/** Indices into `options`, in the order they should be displayed. */
export function optionOrder(prompt: string, options: string[]): number[] {
  const all = options.map((_, i) => i)
  if (isScale(options)) return all
  const movable = all.filter((i) => !STAYS_LAST.test(options[i]))
  const fixed = all.filter((i) => STAYS_LAST.test(options[i]))
  const rng = random(hash(prompt))
  for (let i = movable.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[movable[i], movable[j]] = [movable[j], movable[i]]
  }
  return [...movable, ...fixed]
}
