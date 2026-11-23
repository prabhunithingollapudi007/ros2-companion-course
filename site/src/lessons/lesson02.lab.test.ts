import { describe, expect, it } from 'vitest'
import { isName, numberIn, tidy } from '../lab/answers'
import { lesson02 } from '../transcripts'
import { lesson02Lab } from './lesson02.lab'

// Every answer the lab accepts must be what the commands really printed in the
// course container with labs/lesson02/mystery_graph.py running.

const out = (id: string) => lesson02.runs[id].output
const counts = out('lab-all-counts')
  .split('\n')
  .map((line) => {
    const m = /^(\S+)\s+Publisher count: (\d+) Subscription count: (\d+)/.exec(line)!
    return { topic: m[1], publishers: Number(m[2]), subscriptions: Number(m[3]) }
  })
const robotTopics = counts.filter((c) => !['/parameter_events', '/rosout'].includes(c.topic))

describe('the lab answers come from the recordings', () => {
  it('1: seven nodes', () => {
    expect(out('lab-node-list').split('\n')).toHaveLength(7)
    expect(lesson02Lab[0].check('7')).toBe(true)
  })

  it('2: /lidar publishes /scan', () => {
    expect(out('lab-scan-info')).toContain('Node name: lidar')
    expect(lesson02Lab[1].check('/lidar')).toBe(true)
  })

  it('3: /odom carries nav_msgs/msg/Odometry', () => {
    expect(out('lab-odom-type')).toBe('nav_msgs/msg/Odometry')
    expect(lesson02Lab[2].check('nav_msgs/msg/Odometry')).toBe(true)
  })

  it('4: /planner and /safety_stop publish /cmd_vel, and nothing else does', () => {
    expect(out('lab-cmd-vel-info')).toContain('Publisher count: 2')
    const publishers = [...out('lab-cmd-vel-who').matchAll(/Node name: (\w+)\n(?:.*\n)?Endpoint type: PUBLISHER/g)].map((m) => m[1])
    expect(publishers.sort()).toEqual(['planner', 'safety_stop'])
    expect(lesson02Lab[3].check('planner and safety_stop')).toBe(true)
  })

  it('5: /joint_states runs at 50 Hz', () => {
    const rates = [...out('lab-joint-hz').matchAll(/average rate: ([\d.]+)/g)].map((m) => Number(m[1]))
    expect(rates.length).toBeGreaterThan(0)
    for (const r of rates) expect(Math.round(r)).toBe(50)
    expect(lesson02Lab[4].check('50')).toBe(true)
  })

  it('6: /battery is the only robot topic nobody subscribes to', () => {
    expect(robotTopics.filter((c) => c.subscriptions === 0).map((c) => c.topic)).toEqual(['/battery'])
    expect(lesson02Lab[5].check('/battery')).toBe(true)
  })

  it('7: /emergency_stop is the only topic with a subscriber and no publisher', () => {
    expect(counts.filter((c) => c.publishers === 0).map((c) => c.topic)).toEqual(['/emergency_stop'])
    expect(robotTopics.find((c) => c.topic === '/emergency_stop')!.subscriptions).toBe(1)
    expect(lesson02Lab[6].check('/emergency_stop')).toBe(true)
  })

  it('8: the robot is told to drive at 0.25 m/s', () => {
    expect(out('lab-cmd-vel-echo')).toMatch(/^linear:\n {2}x: 0\.25$/m)
    expect(lesson02Lab[7].check('0.25')).toBe(true)
  })

  it('9: after an emergency stop the motors report "stopped", and the speed command drops to zero', () => {
    expect(out('lab-motor-before')).toContain('data: running')
    expect(out('lab-motor-after')).toContain('data: stopped')
    expect(out('lab-cmd-vel-after')).toMatch(/^linear:\n {2}x: 0\.0$/m)
    expect(lesson02Lab[8].check('stopped')).toBe(true)
  })
})

describe('checking an answer', () => {
  it('accepts the usual ways of writing the same thing', () => {
    expect(lesson02Lab[0].check(' 7 nodes ')).toBe(true)
    expect(lesson02Lab[1].check('lidar')).toBe(true)
    expect(lesson02Lab[2].check('nav_msgs/Odometry')).toBe(true)
    expect(lesson02Lab[3].check('/safety_stop, /planner')).toBe(true)
    expect(lesson02Lab[4].check('50 Hz')).toBe(true)
    expect(lesson02Lab[5].check('battery')).toBe(true)
    expect(lesson02Lab[7].check('0.25 m/s')).toBe(true)
    expect(lesson02Lab[8].check('data: stopped')).toBe(true)
  })

  it('refuses near misses', () => {
    expect(lesson02Lab[0].check('8')).toBe(false)
    expect(lesson02Lab[1].check('/scan')).toBe(false)
    expect(lesson02Lab[2].check('Odometry')).toBe(false)
    expect(lesson02Lab[3].check('planner')).toBe(false)
    expect(lesson02Lab[4].check('5')).toBe(false)
    expect(lesson02Lab[5].check('/rosout')).toBe(false)
    expect(lesson02Lab[6].check('/battery')).toBe(false)
    expect(lesson02Lab[7].check('0.1')).toBe(false)
    expect(lesson02Lab[8].check('running')).toBe(false)
  })

  it('reads names and numbers the forgiving way', () => {
    expect(tidy('  "Stopped." ')).toBe('stopped')
    expect(numberIn('about 49.99 Hz')).toBe(49.99)
    expect(numberIn('none')).toBeNull()
    expect(isName('/odom', 'odom')).toBe(true)
  })
})

describe('every recorded command a question shows', () => {
  it('exists', () => {
    for (const q of lesson02Lab) for (const r of q.how) expect(r).toBeDefined()
  })
})
