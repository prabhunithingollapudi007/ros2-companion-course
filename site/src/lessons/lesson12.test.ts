import { describe, expect, it } from 'vitest'
import { run } from '../ros/params'
import { lesson12 } from '../transcripts'
import { lesson12Lab } from './lesson12.lab'

// Each statement Lesson12.mdx makes, checked against what the commands printed
// in the course container; the playground's model against the same; and every
// lab answer.

const out = (id: string) => lesson12.runs[id].output
const rateIn = (id: string) => Number(/blinking ([\d.]+) times a second/.exec(out(id))?.[1])
const RANGE = { from: 0.5, to: 10 }

describe('what Lesson 12 says, against the recordings', () => {
  it('the blinker has its own parameters, and some every node has', () => {
    const names = out('param-list').split('\n').map((l) => l.trim())
    expect(names).toEqual(expect.arrayContaining(['label', 'rate', 'verbose', 'use_sim_time']))
    expect(out('param-get')).toBe('Double value is: 2.0')
    expect(out('param-describe')).toContain('Description: blinks per second')
    expect(out('param-describe')).toContain('Min value: 0.5')
    expect(out('param-describe')).toContain('Max value: 10.0')
  })

  it('a change in range is applied at once; out of range, the wrong type or an empty label are refused', () => {
    expect(out('param-set')).toBe('Set parameter successful')
    expect(out('blinker-log')).toContain('now blinking 5.0 times a second')
    expect(out('param-set-range')).toContain("doesn't comply with floating point range")
    expect(out('param-set-empty')).toBe('Setting parameter failed: label must not be empty')
    expect(out('param-set-type')).toContain('Wrong parameter type')
    expect(out('param-dump')).toContain('rate: 5.0')
    expect(out('param-dump')).toContain('label: light')
  })

  it('at start, the last of --params-file and -p wins, and out of range stops the node', () => {
    expect(rateIn('start-default')).toBe(2)
    expect(rateIn('start-p')).toBe(4)
    expect(rateIn('start-file')).toBe(1)
    expect(rateIn('start-file-then-p')).toBe(4)
    expect(rateIn('start-p-then-file')).toBe(1)
    expect(out('start-out-of-range')).toContain('InvalidParameterValueException')
    expect(out('porch-launch')).toContain('porch: blinking 1.0 times a second')
    expect(out('porch-launch')).toContain('porch on')
  })
})

describe("the playground's model, against the same recordings", () => {
  it('gives the value each recorded start printed', () => {
    const file = { kind: 'file' as const, value: 1 }
    const arg = { kind: 'arg' as const, value: 4 }
    const value = (o: ReturnType<typeof run>) => (o.started ? o.value : NaN)
    expect(value(run(2, [], RANGE))).toBe(rateIn('start-default'))
    expect(value(run(2, [arg], RANGE))).toBe(rateIn('start-p'))
    expect(value(run(2, [file], RANGE))).toBe(rateIn('start-file'))
    expect(value(run(2, [file, arg], RANGE))).toBe(rateIn('start-file-then-p'))
    expect(value(run(2, [arg, file], RANGE))).toBe(rateIn('start-p-then-file'))
    expect(run(2, [{ kind: 'arg', value: 50 }], RANGE).started).toBe(false)
  })

  it('applies a set in range and refuses one out of range', () => {
    expect(run(2, [], RANGE, [5])).toMatchObject({ started: true, value: 5, origin: 'ros2 param set' })
    expect(run(2, [], RANGE, [50])).toMatchObject({ started: true, value: 2, refused: [50] })
  })
})

describe('the Lesson 12 lab', () => {
  it('the checker fails before the lab and passes the reference solution, which still passes Lesson 10', () => {
    expect(out('lab-check-early')).toMatch(/1 of 7 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 7 checks passed\.$/)
    expect(out('lab-check-10')).toMatch(/All 8 checks passed\.$/)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['2.0', '4', 'wrong type', '1.0', '7']
    const wrong = ['1', '1', 'too fast', '2', '6']
    lesson12Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
