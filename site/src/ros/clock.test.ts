import { describe, expect, it } from 'vitest'
import { lesson06 } from '../transcripts'
import { nodeClock, timerTicks } from './clock'

const START = 1_780_000_000

/** (real time, node clock) pairs from what_time.py's log lines. */
const readings = (id: string) =>
  [...lesson06.runs[id].output.matchAll(/\[(\d+\.\d+)\] \[what_time\]: my clock says ([\d.]+) s/g)].map((m) => [Number(m[1]), Number(m[2])])

/** Node-clock seconds gained per real second, from the first to the last reading. */
const slope = (rows: number[][]) => (rows[rows.length - 1][1] - rows[0][1]) / (rows[rows.length - 1][0] - rows[0][0])

describe('the clock model agrees with the recordings of what_time.py', () => {
  it('without use_sim_time the node reads the computer clock', () => {
    const rows = readings('wall')
    expect(rows.length).toBeGreaterThan(1)
    for (const [real, clock] of rows) expect(Math.abs(real - clock)).toBeLessThan(1)
    expect(nodeClock(3, { simTime: false, clock: true, rate: 1, playAt: 0 }, 1000, START)).toBe(1003)
  })

  it('with use_sim_time and nothing publishing /clock, the clock is zero and the timer never fires', () => {
    expect(lesson06.runs['sim-before'].output).toBe('0')
    expect(nodeClock(3, { simTime: true, clock: false, rate: 1, playAt: 0 }, 1000, START)).toBe(0)
    expect(timerTicks({ simTime: true, clock: false, rate: 1, playAt: 0 }, 5)).toEqual([])
  })

  it('with use_sim_time and --clock it reads the recorded time, one second per second', () => {
    const rows = readings('sim')
    for (const [, clock] of rows) expect(clock - START).toBeGreaterThanOrEqual(0)
    expect(rows[0][1] - START).toBeLessThan(31)
    expect(slope(rows)).toBeCloseTo(1, 1)
    expect(lesson06.runs['sim-during'].output).toContain('2026-05-28')
  })

  it('with --rate 2 the recorded time runs twice as fast, and so does the timer', () => {
    expect(slope(readings('sim-fast'))).toBeCloseTo(2, 1)
    const setup = { simTime: true, clock: true, rate: 2, playAt: 0 }
    expect(nodeClock(2, setup, 1000, START) - START).toBe(4)
    expect(timerTicks(setup, 4)).toHaveLength(8)
  })
})
