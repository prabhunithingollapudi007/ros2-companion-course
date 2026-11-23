import { describe, expect, it } from 'vitest'
import { lesson02 } from '../transcripts'

// Each statement Lesson02.mdx makes about what ROS does, checked against what
// the commands printed in the course container.

const out = (id: string) => lesson02.runs[id].output

describe('what Lesson 2 says, against the recordings', () => {
  it('the talker publishes once a second', () => {
    const rates = [...out('topic-hz').matchAll(/average rate: ([\d.]+)/g)].map((m) => Number(m[1]))
    expect(rates.length).toBeGreaterThan(0)
    for (const rate of rates) expect(rate).toBeCloseTo(1, 1)
  })

  it('/rosout and /parameter_events exist even when nothing else is running', () => {
    expect(out('empty-node-list')).toBe('')
    expect(out('empty-topic-list').split('\n')).toEqual(['/parameter_events', '/rosout'])
  })

  it('Twist is two Vector3 fields of three float64 numbers each', () => {
    const twist = out('interface-twist')
    expect(twist).toMatch(/^Vector3\s+linear$/m)
    expect(twist).toMatch(/^Vector3\s+angular$/m)
    expect(twist.match(/^\tfloat64 [xyz]$/gm)).toHaveLength(6)
  })

  it("String has one field, and its definition says it is for examples", () => {
    const definition = out('interface-string')
    expect(definition.split('\n').filter((line) => line && !line.startsWith('#'))).toEqual(['string data'])
    expect(definition).toMatch(/example/i)
  })

  it('a message published from the terminal reaches the listener', () => {
    expect(out('topic-pub')).toContain("data='hello from the terminal'")
    expect(out('listener-heard')).toMatch(/\[listener\]: I heard: \[hello from the terminal\]$/)
  })

  it('with a second type on the topic, the listener kept hearing greetings and never heard the 42', () => {
    expect(Number(out('mismatch-heard-hello'))).toBeGreaterThan(0)
    expect(out('mismatch-heard-42')).toBe('0')
  })

  it('a listener in domain 1 prints nothing and reports no error, and only domain 1 sees it', () => {
    expect(out('domain1-listener')).toBe('')
    expect(out('domain0-node-list')).toBe('/talker')
    expect(out('domain1-node-list-after')).toBe('/listener')
    expect(out('domain1-export')).toBe('/listener')
    expect(out('domain0-node-list-after')).toBe('/talker')
  })

  it('the lab robot has seven nodes and eight topics of its own', () => {
    expect(out('lab-node-list').split('\n')).toHaveLength(7)
    const own = out('lab-topic-list')
      .split('\n')
      .filter((line) => !line.startsWith('/parameter_events') && !line.startsWith('/rosout'))
    expect(own).toHaveLength(8)
  })

  it('the answer figure has the right number of publishers and subscribers on every topic', () => {
    // [publishers, subscriptions], as drawn in MysteryGraph.
    const drawn: Record<string, [number, number]> = {
      '/joint_states': [1, 1],
      '/scan': [1, 1],
      '/odom': [1, 1],
      '/obstacle': [1, 2],
      '/cmd_vel': [2, 1],
      '/motor_state': [1, 1],
      '/battery': [1, 0],
      '/emergency_stop': [0, 1],
    }
    const recorded = Object.fromEntries(
      out('lab-all-counts')
        .split('\n')
        .map((line) => /^(\S+)\s+Publisher count: (\d+) Subscription count: (\d+)/.exec(line)!)
        .filter((m) => m[1] in drawn)
        .map((m) => [m[1], [Number(m[2]), Number(m[3])]]),
    )
    expect(recorded).toEqual(drawn)
  })

  it('every recording the lesson page shows exists', () => {
    for (const id of ['talker', 'listener', 'node-list', 'topic-list', 'topic-info', 'node-info', 'interface-twist', 'interface-string', 'topic-pub', 'mismatch-pub', 'mismatch-list', 'mismatch-info', 'mismatch-echo', 'topic-info-while-echo', 'node-list-while-echo', 'node-list-all', 'domain1-listener', 'domain0-node-list', 'domain1-node-list-after', 'domain1-export', 'topic-echo', 'topic-hz']) {
      expect(lesson02.runs[id], id).toBeDefined()
    }
  })
})
