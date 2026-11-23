import { describe, expect, it } from 'vitest'
import { START, STATUS, allowed, finished, step, type Goal, type GoalEvent } from '../ros/action'
import { lesson11 } from '../transcripts'
import { lesson11Lab } from './lesson11.lab'

// Each statement Lesson11.mdx makes, checked against what the commands printed
// in the course container; the playground's model; and every lab answer.

const out = (id: string) => lesson11.runs[id].output
const lines = (id: string) => out(id).split('\n')
const walk = (...events: GoalEvent[]) => events.reduce<Goal>((g, e) => step(g, e), START)

describe('what Lesson 11 says, against the recordings', () => {
  it('an action type is goal, result and feedback', () => {
    const fields = out('drive-show')
      .split('\n')
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => l.split('#')[0].trim())
    expect(fields).toEqual(['float64 distance', 'float64 speed', '---', 'float64 travelled', '---', 'float64 remaining'])
  })

  it('the server offers /drive_distance; one server, no clients yet', () => {
    expect(out('action-list')).toBe('/drive_distance [drive_interfaces/action/DriveDistance]')
    expect(lines('action-info')).toEqual(['Action: /drive_distance', 'Action clients: 0', 'Action servers: 1', '    /drive_server'])
  })

  it('a goal succeeds, with feedback in steps of 0.05 m', () => {
    expect(out('send-goal')).toContain('travelled: 1.0')
    expect(out('send-goal')).toContain('Goal finished with status: SUCCEEDED')
    const remaining = [...out('send-goal-feedback').matchAll(/remaining: (-?[\d.e-]+)/g)].map((m) => Number(m[1]))
    expect(remaining.length).toBe(6)
    remaining.forEach((r, i) => expect(r).toBeCloseTo(0.25 - 0.05 * i, 9))
  })

  it('bad goals and goals while busy are rejected', () => {
    expect(out('send-goal-bad')).toContain('Goal was rejected.')
    expect(out('send-goal-busy')).toContain('Goal was rejected.')
    expect(out('server-log')).toContain('rejected: distance and speed must be more than 0')
    expect(out('server-log')).toContain('rejected: already driving')
  })

  it('a cancel is requested, then honoured at the next pass of the loop, part of the way', () => {
    const travelled = Number(/canceled: travelled ([\d.]+) m/.exec(out('client-cancel'))?.[1])
    expect(travelled).toBeGreaterThan(0.5)
    expect(travelled).toBeLessThan(3)
    const log = lines('server-log')
    const asked = log.findIndex((l) => l.includes('cancel requested'))
    expect(asked).toBeGreaterThan(-1)
    expect(log[asked + 1]).toContain(`cancelled after ${travelled.toFixed(2)} m`)
  })

  it('an action is two hidden topics and three hidden services', () => {
    expect(lines('action-topics')).toEqual([
      '/drive_distance/_action/feedback',
      '/drive_distance/_action/status',
      '/drive_distance/_action/cancel_goal',
      '/drive_distance/_action/get_result',
      '/drive_distance/_action/send_goal',
    ])
  })
})

describe("the playground's model of a goal", () => {
  it('follows the recorded goals: succeeded, rejected, and canceled', () => {
    expect(walk('send', 'accept', 'execute', 'feedback', 'succeed').state).toBe('succeeded')
    expect(walk('send', 'reject').state).toBe('rejected')
    expect(walk('send', 'accept', 'execute', 'cancel', 'finish canceled').state).toBe('canceled')
    expect(STATUS.succeeded?.name).toBe('SUCCEEDED')
  })

  it('only allows what can happen next', () => {
    expect(allowed(START)).toEqual(['send'])
    expect(walk('send', 'succeed')).toEqual({ state: 'none', sent: true })
    expect(finished(walk('send', 'accept', 'execute', 'abort'))).toBe(true)
    expect(finished(walk('send', 'accept'))).toBe(false)
  })
})

describe('the Lesson 11 lab', () => {
  it('the checker fails before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 8 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 8 checks passed\.$/)
    const report = JSON.parse(out('lab-client'))
    expect(report).toMatchObject({ accepted: true, status: 'succeeded', level: 0.3 })
    expect(report.feedback.length).toBe(10)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['1', 'SUCCEEDED', 'rejected', '3', '8']
    const wrong = ['2', 'ABORTED', 'queued', '5', '7']
    lesson11Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
