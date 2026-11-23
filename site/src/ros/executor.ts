// An executor running timer callbacks, for the Lesson 15 playgrounds. Like
// rclcpp: a timer that comes due while it cannot run fires once when it can
// (missed periods are skipped, not queued); callbacks in one mutually exclusive
// group never overlap; and there are only as many callbacks running as threads.
// lesson15.test.ts compares the counts with busy_node's in the recordings.

export interface TimerSpec {
  name: string
  period: number
  /** How long its callback runs. */
  work: number
  group: string
}

export interface Run {
  name: string
  thread: number
  start: number
  end: number
}

const EPS = 1e-9

/** Every callback run in `seconds` of spinning with `threads` threads. */
export function simulate(timers: TimerSpec[], threads: number, seconds: number, dt = 0.001): Run[] {
  const next = timers.map((t) => t.period)
  const busyUntil = Array.from({ length: threads }, () => 0)
  const groupBusyUntil: Record<string, number> = {}
  const runs: Run[] = []
  for (let now = 0; now < seconds - EPS; now = Math.round((now + dt) / dt) * dt) {
    // Ready timers, in the order the executor looks at them.
    timers.forEach((t, i) => {
      if (next[i] > now + EPS) return
      const thread = busyUntil.findIndex((b) => b <= now + EPS)
      if (thread < 0 || (groupBusyUntil[t.group] ?? 0) > now + EPS) return
      const end = now + t.work
      runs.push({ name: t.name, thread, start: now, end })
      busyUntil[thread] = end
      groupBusyUntil[t.group] = end
      // The next call is the first period boundary after now: missed ones are skipped.
      next[i] = (Math.floor((now + EPS) / t.period) + 1) * t.period
    })
  }
  return runs
}

/** busy_node's two timers, with the slow one's work and the grouping chosen. */
export function busyNode(separate: boolean, slowWork = 1.5): TimerSpec[] {
  return [
    { name: 'slow', period: 2, work: slowWork, group: separate ? 'slow' : 'default' },
    { name: 'fast', period: 0.1, work: 0.0005, group: separate ? 'fast' : 'default' },
  ]
}

export const count = (runs: Run[], name: string) => runs.filter((r) => r.name === name).length
