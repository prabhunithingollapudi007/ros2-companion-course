import { describe, expect, it } from 'vitest'
import { lesson06 } from '../transcripts'
import { exactPairs, nearestPairs, stamps } from './pairing'

// The weather bag: temperature 4 times a second from 0.03 s, humidity once a second from 0.11 s.
const START = 1_780_000_000
const temperature = stamps(4, 0.03, 30)
const humidity = stamps(1, 0.11, 30)

/** The (temperature, humidity) stamps pair_printer printed, relative to the bag's start. */
const recorded = [...lesson06.runs.pairs.output.matchAll(/temperature at ([\d.]+) s with humidity at ([\d.]+) s/g)].map(
  (m) => [+(Number(m[1]) - START).toFixed(2), +(Number(m[2]) - START).toFixed(2)],
)

describe('pairing the weather bag', () => {
  it('has 120 temperature and 30 humidity stamps, none of them equal', () => {
    expect(temperature).toHaveLength(120)
    expect(humidity).toHaveLength(30)
    expect(exactPairs(temperature, humidity)).toEqual([])
  })

  it('pair_printer paired every humidity reading with the nearest temperature reading', () => {
    expect(recorded.length).toBeGreaterThan(3)
    const model = new Map(nearestPairs(humidity, temperature, 0.5).map(([t, h]) => [h.toFixed(2), t.toFixed(2)]))
    for (const [t, h] of recorded) expect(model.get(h.toFixed(2))).toBe(t.toFixed(2))
  })

  it('pairs never reuse a reading, and respect the slop', () => {
    const pairs = nearestPairs(humidity, temperature, 0.05)
    expect(pairs).toEqual([])
    const wide = nearestPairs(humidity, temperature, 0.5)
    expect(new Set(wide.map(([t]) => t)).size).toBe(wide.length)
    expect(wide).toHaveLength(30)
  })
})
