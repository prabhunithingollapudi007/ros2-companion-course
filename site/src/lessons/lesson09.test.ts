import { describe, expect, it } from 'vitest'
import { PAIRS, bridgeRule, canBridge, parseRule } from '../ros/bridge'
import { ROVER_DRIVE, bodySpeeds, drive, wheelSpeeds } from '../ros/diffdrive'
import { ROVER } from '../ros/rover'
import { lesson09 } from '../transcripts'
import { lesson09Lab, recordedDistance } from './lesson09.lab'

// Each statement Lesson09.mdx makes, checked against what the commands printed
// in the course container; the playgrounds' models against the same; and every
// lab answer against the recordings.

const out = (id: string) => lesson09.runs[id].output
const xOf = (id: string) => Number(/x: (-?[\d.e-]+)/.exec(out(id))?.[1])

describe('what Lesson 9 says, against the recordings', () => {
  it('the bridged topics appear on the ROS side, with /clock counting simulated seconds', () => {
    expect(out('sim-topics').split('\n')).toEqual(
      expect.arrayContaining(['/clock', '/cmd_vel', '/joint_states', '/odom', '/robot_description', '/tf', '/tf_static']),
    )
    const sec = Number(/sec: (\d+)/.exec(out('sim-clock'))?.[1])
    expect(sec).toBeGreaterThan(0)
    expect(sec).toBeLessThan(120) // seconds since the simulation started, not a date
    expect(out('sim-param')).toBe('Boolean value is: True')
  })

  it('three seconds at 0.4 m/s move the rover forward, and it keeps going on the last command', () => {
    const before = xOf('odom-before')
    const after = xOf('odom-after')
    const later = xOf('odom-later')
    expect(Math.abs(before)).toBeLessThan(0.01)
    expect(after - before).toBeGreaterThan(1.0)
    expect(after - before).toBeLessThan(2.0)
    expect(later - after).toBeGreaterThan(0.5)
  })

  it('a rule with matching types creates a bridge in the direction given; a mismatched one is refused', () => {
    expect(out('bridge-both')).toContain('Creating GZ->ROS Bridge: [/chat (gz.msgs.StringMsg) -> /chat (std_msgs/msg/String)]')
    expect(out('bridge-both')).toContain('Creating ROS->GZ Bridge: [/chat (std_msgs/msg/String) -> /chat (gz.msgs.StringMsg)]')
    expect(out('bridge-both')).toContain('Creating ROS->GZ Bridge: [/cmd_vel (geometry_msgs/msg/Twist) -> /cmd_vel (gz.msgs.Twist)]')
    expect(out('bridge-both')).not.toContain('GZ->ROS Bridge: [/cmd_vel')
    expect(out('bridge-bad')).toContain('No template specialization for the pair')
  })

  it('Gazebo lists the bridged topics among its own', () => {
    const topics = out('gz-topics').split('\n')
    expect(topics).toEqual(expect.arrayContaining(['/clock', '/cmd_vel', '/odom', '/tf', '/joint_states']))
    expect(topics.length).toBeGreaterThan(5)
  })
})

describe("the playgrounds' models", () => {
  it("the rover's wheel separation is the distance between its wheels' centres", () => {
    expect(ROVER_DRIVE.separation).toBeCloseTo(ROVER.baseWidth + ROVER.wheelWidth, 12)
    expect(ROVER_DRIVE.radius).toBe(ROVER.wheelRadius)
  })

  it('wheel speeds and body speeds are each other’s inverse', () => {
    const { left, right } = wheelSpeeds(ROVER_DRIVE, 0.4, 0.3)
    const back = bodySpeeds(ROVER_DRIVE, left, right)
    expect(back.v).toBeCloseTo(0.4, 12)
    expect(back.w).toBeCloseTo(0.3, 12)
    expect(bodySpeeds(ROVER_DRIVE, -5, 5).v).toBe(0)
  })

  it('driving: straight at 0.4 m/s for 3 s is 1.2 m; a full circle comes back to the start', () => {
    expect(drive({ x: 0, y: 0, yaw: 0 }, 0.4, 0, 3).x).toBeCloseTo(1.2, 12)
    const round = drive({ x: 0, y: 0, yaw: 0 }, 0.4, 0.5, (2 * Math.PI) / 0.5)
    expect(round.x).toBeCloseTo(0, 9)
    expect(round.y).toBeCloseTo(0, 9)
  })

  it('every pair the playground offers is one the bridge accepted in the container', () => {
    for (const p of PAIRS) expect(canBridge(p.ros, p.gz)).toBe(true)
    expect(canBridge('geometry_msgs/msg/Twist', 'gz.msgs.Odometry')).toBe(false)
    const rule = bridgeRule('/cmd_vel', 'geometry_msgs/msg/Twist', ']', 'gz.msgs.Twist')
    expect(lesson09.runs['bridge-both'].command).toContain(rule)
    expect(parseRule(rule)).toEqual({ topic: '/cmd_vel', ros: 'geometry_msgs/msg/Twist', direction: ']', gz: 'gz.msgs.Twist' })
  })
})

describe('the Lesson 9 lab', () => {
  it('the checker fails before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 9 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 9 checks passed\.$/)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['/clock', 'True', recordedDistance().toFixed(1), ']', '9']
    const wrong = ['/time', 'False', '0.4', '[', '8']
    lesson09Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
