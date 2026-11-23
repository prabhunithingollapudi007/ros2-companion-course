// A subscription with a queue of fixed depth, fed faster than its callback can
// keep up. Messages wait in the queue; when it is full, the oldest is dropped to
// make room ("keep last"). Each time the callback finishes, the oldest message
// still waiting is handled next.
//
// queue.test.ts checks this against Lesson 4's recordings of slow_listener.

export interface QueueRun {
  /** Message numbers in the order they were handled, with the time each started. */
  handled: { n: number; at: number }[]
  /** Message numbers that were dropped before they could be handled. */
  dropped: number[]
  /** How many messages were waiting at the end. */
  waiting: number
}

/**
 * Messages 1, 2, 3, ... arrive every 1/rate seconds starting at t = 1/rate; the
 * callback takes `duration` seconds. Runs for `seconds`.
 */
export function simulateQueue(rate: number, duration: number, depth: number, seconds: number): QueueRun {
  const queue: number[] = []
  const handled: { n: number; at: number }[] = []
  const dropped: number[] = []
  const period = 1 / rate
  let busyUntil = 0
  let next = 1
  // Step through time in small increments; fine enough for the rates used here.
  const dt = Math.min(period, duration) / 20
  for (let t = 0; t <= seconds + 1e-9; t += dt) {
    while (next * period <= t + 1e-9) {
      queue.push(next)
      if (queue.length > depth) dropped.push(queue.shift()!)
      next += 1
    }
    if (t + 1e-9 >= busyUntil && queue.length > 0) {
      handled.push({ n: queue.shift()!, at: t })
      busyUntil = t + duration
    }
  }
  return { handled, dropped, waiting: queue.length }
}

/** The gaps between consecutive handled message numbers. */
export const gaps = (run: QueueRun) => run.handled.slice(1).map((h, i) => h.n - run.handled[i].n)
