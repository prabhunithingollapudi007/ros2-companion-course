import { describe, expect, it } from 'vitest'
import { latestAt, publishTimes, serve } from '../ros/service'
import { lesson10 } from '../transcripts'
import { lesson10Lab } from './lesson10.lab'

// Each statement Lesson10.mdx makes, checked against what the commands printed
// in the course container; the playground's model; and every lab answer.

const out = (id: string) => lesson10.runs[id].output
const lines = (id: string) => out(id).split('\n')

describe('what Lesson 10 says, against the recordings', () => {
  it('the demo server offers /add_two_ints, and every node also offers parameter services', () => {
    expect(lines('service-list')).toContain('/add_two_ints [example_interfaces/srv/AddTwoInts]')
    expect(lines('service-list').filter((l) => l.startsWith('/add_two_ints_server/')).length).toBeGreaterThanOrEqual(6)
    expect(out('add-type')).toBe('example_interfaces/srv/AddTwoInts')
  })

  it('a service type is a request above --- and a response below', () => {
    expect(lines('add-show')).toEqual(['int64 a', 'int64 b', '---', 'int64 sum'])
    expect(out('add-call')).toContain('AddTwoInts_Response(sum=5)')
    expect(out('add-server-log')).toContain('a: 2 b: 3')
  })

  it('calling a service nobody offers waits for one', () => {
    expect(out('no-server')).toBe('waiting for service to become available...')
    expect(lesson10.runs['no-server'].ended).toBe('stopped')
  })

  it("the counter's two services, and the answers to good and bad requests", () => {
    expect(lines('counter-info')).toEqual(expect.arrayContaining(['    /reset: std_srvs/srv/Trigger', '    /set_step: counter_interfaces/srv/SetStep']))
    expect(out('call-step')).toContain("SetStep_Response(accepted=True, message='counting in steps of 10')")
    expect(out('call-step-bad')).toContain("SetStep_Response(accepted=False, message='step must be from 1 to 100, not 500')")
    expect(out('call-reset')).toMatch(/Trigger_Response\(success=True, message='was at \d+'\)/)
    expect(out('counter-log')).toContain('counting in steps of 10')
    expect(out('counter-log')).toContain('counting in steps of 3')
    expect(out('counter-log')).not.toContain('500')
  })

  it('after a step of 10, the count goes up by 10 a second', () => {
    const counts = [...out('count-steps').matchAll(/data: (\d+)/g)].map((m) => Number(m[1]))
    expect(counts.length).toBe(2)
    expect(counts[1] - counts[0]).toBe(10)
  })

  it('the client gets its answer, waiting first when the server is not there yet', () => {
    expect(out('step-client')).toContain('accepted: yes, counting in steps of 3')
    expect(out('client-waits')).toContain('waiting for /set_step...')
    expect(out('client-waits').trim().split('\n').pop()).toContain('accepted: yes, counting in steps of 4')
  })
})

describe("the playground's model", () => {
  it('a client waits for the server to start, then for the requests before its own', () => {
    const [a, b] = serve(
      [
        { client: 'A', at: 1 },
        { client: 'B', at: 1.5 },
      ],
      2,
      1,
    )
    expect(a).toMatchObject({ client: 'A', sent: 2, started: 2, answered: 3 })
    expect(b).toMatchObject({ client: 'B', sent: 2, started: 3, answered: 4 })
  })

  it('a topic reader gets the latest message, or nothing before the first', () => {
    const published = publishTimes(1, 1, 5)
    expect(published).toEqual([1, 2, 3, 4, 5])
    expect(latestAt(0.5, published)).toBeNull()
    expect(latestAt(2.4, published)?.age).toBeCloseTo(0.4, 9)
  })
})

describe('the Lesson 10 lab', () => {
  it('the checker fails before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 8 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 8 checks passed\.$/)
    expect(out('lab-call')).toContain("SetMode_Response(success=True, message='mode careful', max_speed=0.3)")
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['5', 'std_srvs/srv/Trigger', 'False', '/counter', '8']
    const wrong = ['6', 'std_srvs/srv/Empty', 'True', '/step_client', '7']
    lesson10Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
