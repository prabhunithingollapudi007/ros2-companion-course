import { describe, expect, it } from 'vitest'
import { CASES, REQUIREMENTS, buildGraph } from '../ros/design'
import { lesson13 } from '../transcripts'
import { lesson13Lab } from './lesson13.lab'

// Each statement Lesson13.mdx makes, checked against what the commands printed
// in the course container; the playgrounds' models; and every lab answer.

const out = (id: string) => lesson13.runs[id].output
const speed = (id: string) => Number(out(id).split('\n')[0])

describe('what Lesson 13 says, against the recordings', () => {
  it('the stack runs robot_state_publisher, the bridge and the speed limiter as ROS nodes', () => {
    expect(out('stack-nodes').split('\n')).toEqual(['/robot_state_publisher', '/ros_gz_bridge', '/speed_limiter'])
  })

  it('the limiter listens on /cmd_vel_in and, remapped, drives /cmd_vel', () => {
    expect(out('limiter-info')).toContain('/cmd_vel_in: geometry_msgs/msg/Twist')
    expect(out('limiter-info')).toMatch(/Publishers:\n {4}\/cmd_vel: geometry_msgs\/msg\/Twist/)
  })

  it('asked for 1.5 m/s, the rover does 0.8 from stack.yaml, and is still doing it after the commands stop', () => {
    expect(speed('stack-speed')).toBeCloseTo(0.8, 3)
    expect(speed('stack-speed-later')).toBeCloseTo(0.8, 3)
  })
})

describe("the playgrounds' models", () => {
  it('has ten cases, each with an answer and a reason', () => {
    expect(CASES.length).toBe(10)
    for (const c of CASES) expect(['topic', 'service', 'action', 'parameter']).toContain(c.answer)
    expect(new Set(CASES.map((c) => c.answer)).size).toBe(4)
  })

  it('builds the chains of the example and of the lab solution', () => {
    const example = buildGraph(['sim', 'teleop', 'limit'])
    expect(example.edges).toEqual(
      expect.arrayContaining([
        { from: 'teleop_twist_keyboard', to: 'speed_limiter', topic: '/cmd_vel_in', kind: 'topic' },
        { from: 'speed_limiter', to: 'gazebo + bridge', topic: '/cmd_vel', kind: 'topic' },
      ]),
    )
    const lab = buildGraph(['sim', 'teleop', 'limit', 'watchdog'])
    expect(lab.edges).toEqual(
      expect.arrayContaining([
        { from: 'speed_limiter', to: 'cmd_watchdog', topic: '/cmd_vel_limited', kind: 'topic' },
        { from: 'cmd_watchdog', to: 'gazebo + bridge', topic: '/cmd_vel', kind: 'topic' },
      ]),
    )
    expect(buildGraph(['sim', 'teleop']).edges).toContainEqual({ from: 'teleop_twist_keyboard', to: 'gazebo + bridge', topic: '/cmd_vel', kind: 'topic' })
    expect(REQUIREMENTS.length).toBe(6)
  })
})

describe('the Lesson 13 lab', () => {
  it('the checker fails before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 8 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 8 checks passed\.$/)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['/cmd_vel', '0.8', 'topic', '8']
    const wrong = ['/cmd_vel_in', '0', 'service', '7']
    lesson13Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
