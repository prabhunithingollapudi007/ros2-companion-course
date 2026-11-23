import { describe, expect, it } from 'vitest'
import { callerTimeline, outcomes } from '../ros/deadlock'
import { busyNode, count, simulate } from '../ros/executor'
import { lesson15 } from '../transcripts'
import { lesson15Lab } from './lesson15.lab'

// Each statement Lesson15.mdx makes, checked against what the commands printed
// in the course container; the playgrounds' models against the same; and every
// lab answer.

const out = (id: string) => lesson15.runs[id].output
const counts = (id: string) => {
  const m = /slow ran (\d+) times, fast ticked (\d+) times/.exec(out(id))
  return { slow: Number(m?.[1]), fast: Number(m?.[2]) }
}

describe('what Lesson 15 says, against the recordings', () => {
  it('one thread, or two threads with one group: the fast timer loses nearly half its ticks', () => {
    for (const id of ['busy-1-same', 'busy-2-same']) {
      expect(counts(id).slow).toBe(2)
      expect(counts(id).fast).toBeGreaterThan(20)
      expect(counts(id).fast).toBeLessThan(32)
    }
  })

  it('two threads and a group per timer: the fast timer keeps its 45 ticks, give or take one', () => {
    expect(counts('busy-2-separate').slow).toBe(2)
    expect(Math.abs(counts('busy-2-separate').fast - 45)).toBeLessThanOrEqual(2)
  })

  it('waiting inside the callback gets no answer; a group of its own, or a response callback, does', () => {
    expect(out('caller-wait').split('\n')).toEqual([
      expect.stringContaining('1 + 100: no answer after 2 s'),
      expect.stringContaining('2 + 100: no answer after 2 s'),
    ])
    for (const id of ['caller-groups', 'caller-callback']) {
      expect(out(id).split('\n')).toEqual([expect.stringContaining('1 + 100 = 101'), expect.stringContaining('2 + 100 = 102')])
    }
  })

  it('the frozen battery monitor publishes nothing and does not even answer for its parameters', () => {
    expect(out('lab-frozen-echo').trim()).toBe('')
    expect(out('lab-frozen-params')).toBe('exit code 124')
  })
})

describe("the playgrounds' models, against the same recordings", () => {
  it('the executor model gives busy_node’s counts', () => {
    const one = simulate(busyNode(false), 1, 4.5)
    const twoSame = simulate(busyNode(false), 2, 4.5)
    const twoSeparate = simulate(busyNode(true), 2, 4.5)
    expect(count(one, 'slow')).toBe(2)
    expect(Math.abs(count(one, 'fast') - counts('busy-1-same').fast)).toBeLessThanOrEqual(2)
    expect(Math.abs(count(twoSame, 'fast') - counts('busy-2-same').fast)).toBeLessThanOrEqual(2)
    expect(Math.abs(count(twoSeparate, 'fast') - counts('busy-2-separate').fast)).toBeLessThanOrEqual(2)
  })

  it('the caller model: timeouts when waiting, answers otherwise, one a second', () => {
    expect(outcomes(callerTimeline('wait', 7)).every((o) => o === 'timeout')).toBe(true)
    expect(outcomes(callerTimeline('groups', 7))).toEqual(Array(7).fill('answer'))
    expect(outcomes(callerTimeline('callback', 7))).toEqual(Array(7).fill('answer'))
    expect(callerTimeline('wait', 8).filter((b) => b.outcome).map((b) => Number(b.start.toFixed(2)))).toEqual([1, 3.02, 5.04, 7.06])
  })
})

describe('the Lesson 15 lab', () => {
  it('the checker fails the frozen node and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/2 of 5 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 5 checks passed\.$/)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['2', 'two threads and separate groups', '124', '5']
    const wrong = ['3', 'one thread', '0', '4']
    lesson15Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
