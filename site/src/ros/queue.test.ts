import { describe, expect, it } from 'vitest'
import { lesson04 } from '../transcripts'
import { gaps, simulateQueue } from './queue'

/** Message numbers from slow_listener's "Handling number N" lines. */
const handledIn = (id: string) => [...lesson04.runs[id].output.matchAll(/Handling number (\d+)/g)].map((m) => Number(m[1]))
const steps = (ns: number[]) => ns.slice(1).map((n, i) => n - ns[i])

describe('the handled-number pattern computed in the container', () => {
  it('steps of 5 with a queue of 3, steps of 1 with a queue of 100', () => {
    expect(lesson04.runs['slow-3-steps'].output).toBe('5')
    expect(lesson04.runs['slow-100-steps'].output).toBe('1')
  })
})

describe('the queue model agrees with the recordings of slow_listener', () => {
  // counter publishes 20 messages a second; slow_listener takes 0.25 s per message.
  it('with a queue of 3, every fifth message is handled once it settles, and the rest are dropped', () => {
    const recorded = steps(handledIn('slow-3-handled'))
    expect(recorded.length).toBeGreaterThan(4)
    expect(new Set(recorded)).toEqual(new Set([5]))

    const model = simulateQueue(20, 0.25, 3, 6)
    expect(new Set(gaps(model).slice(3))).toEqual(new Set([5]))
    expect(model.dropped.length).toBeGreaterThan(0)
  })

  it('with a queue of 100, every message is handled in order, and the backlog grows', () => {
    const recorded = steps(handledIn('slow-100'))
    expect(recorded.length).toBeGreaterThan(10)
    expect(new Set(recorded)).toEqual(new Set([1]))

    const model = simulateQueue(20, 0.25, 100, 6)
    expect(new Set(gaps(model))).toEqual(new Set([1]))
    expect(model.dropped).toEqual([])
    expect(model.waiting).toBeGreaterThan(50)
  })

  it('either way the callback handles four messages a second', () => {
    const times = [...lesson04.runs['slow-3'].output.matchAll(/\[(\d+\.\d+)\]/g)].map((m) => Number(m[1]))
    const perSecond = (times.length - 1) / (times[times.length - 1] - times[0])
    expect(perSecond).toBeCloseTo(4, 0)
    const model = simulateQueue(20, 0.25, 3, 6)
    expect(model.handled.length / 6).toBeCloseTo(4, 0)
  })

  it('a queue of 100 is full after about six seconds, and drops from then on', () => {
    expect(simulateQueue(20, 0.25, 100, 6).dropped).toEqual([])
    expect(simulateQueue(20, 0.25, 100, 6.6).dropped.length).toBeGreaterThan(0)
  })

  it('a queue deep enough for the burst drops nothing while it lasts', () => {
    expect(simulateQueue(10, 0.05, 1, 3).dropped).toEqual([])
    expect(simulateQueue(10, 0.2, 1, 3).dropped.length).toBeGreaterThan(0)
  })
})
