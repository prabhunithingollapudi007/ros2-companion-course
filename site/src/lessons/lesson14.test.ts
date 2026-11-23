import { describe, expect, it } from 'vitest'
import { compatible, deliver } from '../ros/qos'
import { lesson14 } from '../transcripts'
import { lesson14Lab } from './lesson14.lab'

// Each statement Lesson14.mdx makes, checked against what the commands printed
// in the course container; the playgrounds' models against the same; and every
// lab answer.

const out = (id: string) => lesson14.runs[id].output

describe('what Lesson 14 says, against the recordings', () => {
  it('the container uses Fast DDS', () => {
    expect(out('doctor-rmw')).toContain('middleware name    : rmw_fastrtps_cpp')
    expect(out('rmw-packages').split('\n')).toContain('rmw_fastrtps_cpp')
  })

  it('a reliable request to a best-effort offer gives a warning and silence; best effort hears it', () => {
    expect(out('echo-reliable')).toContain('offering incompatible QoS')
    expect(out('echo-reliable')).toContain('Last incompatible policy: RELIABILITY')
    expect(out('echo-reliable')).not.toContain('data:')
    expect(out('echo-best-effort')).toContain('data: hello')
    expect(out('topic-info-qos')).toContain('Reliability: BEST_EFFORT')
  })

  it('a late transient-local subscription gets the last message; a volatile one does not', () => {
    expect(out('pub-latched')).toContain("publishing #1: std_msgs.msg.String(data='ready')")
    expect(out('echo-late-tl')).toContain('data: ready')
    expect(out('echo-late-volatile').trim()).toBe('')
  })

  it('with discovery off, the talker is invisible', () => {
    expect(out('off-node-list').trim()).toBe('')
    expect(out('off-echo')).toContain('does not appear to be published yet')
  })

  it('through a discovery server the pair talks; only a super client sees them', () => {
    expect(out('ds-server')).toContain('Participant Type:   SERVER')
    expect(out('ds-heard')).toMatch(/I heard: \[Hello World: \d+\]/)
    expect(out('ds-plain-list').trim()).toBe('')
    expect(out('ds-super-list').split('\n')).toEqual(['/listener', '/talker'])
  })
})

describe("the playgrounds' models", () => {
  it('match the warnings the recordings show', () => {
    const lidar = compatible({ reliability: 'best_effort', durability: 'volatile' }, { reliability: 'reliable', durability: 'volatile' })
    expect(lidar).toEqual({ ok: false, policy: 'RELIABILITY' })
    expect(out('lab-lidar')).toContain('Last incompatible policy: RELIABILITY')
    const map = compatible({ reliability: 'reliable', durability: 'volatile' }, { reliability: 'reliable', durability: 'transient_local' })
    expect(map).toEqual({ ok: false, policy: 'DURABILITY' })
    expect(out('lab-map')).toContain('Last incompatible policy: DURABILITY')
    expect(compatible({ reliability: 'reliable', durability: 'transient_local' }, { reliability: 'best_effort', durability: 'volatile' })).toEqual({ ok: true })
  })

  it('a lossy link: best effort loses messages, reliable delivers all of them, late and in order', () => {
    const best = deliver(30, 0.1, 0.3, 0.02, 'best_effort')
    const rel = deliver(30, 0.1, 0.3, 0.02, 'reliable')
    expect(best.filter((d) => d.at === null).length).toBeGreaterThan(0)
    expect(rel.every((d) => d.at !== null)).toBe(true)
    const times = rel.map((d) => d.at as number)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(deliver(30, 0.1, 0, 0.02, 'reliable').every((d) => Math.abs((d.at as number) - d.sent - 0.02) < 1e-12)).toBe(true)
  })
})

describe('the Lesson 14 lab', () => {
  it('each graph is silent as given, and the checker passes the reference fixes', () => {
    expect(out('lab-lidar')).toContain('obstacle_watch: received 0 scans')
    expect(out('lab-map')).toContain('planner: received 0 map messages')
    expect(out('lab-odom')).toContain('dashboard: received 0 odometry messages')
    expect(out('lab-odom-topics').split('\n')).toEqual(['/odom', '/robot1/odom'])
    expect(out('lab-check-early')).toMatch(/1 of 5 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 5 checks passed\.$/)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['RELIABILITY', 'durability', '/robot1/odom', 'rmw_fastrtps_cpp', '5']
    const wrong = ['durability', 'reliability', '/odom', 'rmw_cyclonedds_cpp', '4']
    lesson14Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
