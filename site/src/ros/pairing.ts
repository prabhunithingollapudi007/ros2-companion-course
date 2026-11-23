// Pairing two streams of stamped readings, as Lesson 6 explains it.
//
// Exact pairing matches only identical stamps, which separate sensors almost
// never produce. Approximate pairing is shown here in its simplest form: each
// reading of the slower stream is paired with the nearest unused reading of the
// faster one, if it is close enough. message_filters' ApproximateTime policy is
// more general than this, but for streams like the weather bag's it makes the
// same pairs; pairing.test.ts checks that against the recording.

/** Stamps of a sensor read `rate` times a second, starting `offset` seconds in, for `seconds`. */
export function stamps(rate: number, offset: number, seconds: number): number[] {
  const n = Math.floor(seconds * rate + 1e-9)
  return Array.from({ length: n }, (_, k) => +(k / rate + offset).toFixed(6))
}

export function exactPairs(a: number[], b: number[]): [number, number][] {
  const set = new Set(b.map((s) => s.toFixed(6)))
  return a.filter((s) => set.has(s.toFixed(6))).map((s) => [s, s])
}

/** For each stamp of `slow`, the nearest unused stamp of `fast` no more than `slop` away. */
export function nearestPairs(slow: number[], fast: number[], slop: number): [number, number][] {
  const used = new Set<number>()
  const pairs: [number, number][] = []
  for (const s of slow) {
    let best = -1
    for (let i = 0; i < fast.length; i++) {
      if (used.has(i) || Math.abs(fast[i] - s) > slop) continue
      if (best < 0 || Math.abs(fast[i] - s) < Math.abs(fast[best] - s)) best = i
    }
    if (best >= 0) {
      used.add(best)
      pairs.push([fast[best], s])
    }
  }
  return pairs
}
