import { describe, expect, it } from 'vitest'
import { DEFAULTS, command, runGoTo } from '../ros/goto'
import { lesson17 } from '../transcripts'
import { lesson17Lab } from './lesson17.lab'

// Each statement Lesson17.mdx makes, checked against what the commands printed
// in the course container; the controller model against the recorded path; and
// every lab answer.

const out = (id: string) => lesson17.runs[id].output
const path = out('cap-path')
  .split('\n')
  .map((l) => l.trim().split(/\s+/).map(Number))
  .filter((p) => p.length === 3 && p.every(Number.isFinite))
  .map(([t, x, y]) => ({ t, x, y }))

describe('what Lesson 17 says, against the recordings', () => {
  it('the whole stack and go_to run, and go_to offers the action', () => {
    expect(out('cap-nodes').split('\n')).toEqual(expect.arrayContaining(['/go_to', '/speed_limiter', '/cmd_watchdog', '/robot_state_publisher', '/ros_gz_bridge']))
    expect(out('cap-actions')).toBe('/go_to [capstone_interfaces/action/GoTo]')
  })

  it('the goal (2, -1) is reached, and the bag holds the run', () => {
    expect(out('cap-goal')).toContain('reached: true')
    expect(out('cap-goal')).toContain('Goal finished with status: SUCCEEDED')
    for (const topic of ['/odom', '/cmd_vel', '/cmd_vel_in']) expect(out('cap-bag')).toMatch(new RegExp(`Topic: ${topic} \\|`))
  })

  it('the recorded path starts at the origin and ends within 0.1 m of the goal', () => {
    expect(path.length).toBeGreaterThan(10)
    expect(Math.hypot(path[0].x, path[0].y)).toBeLessThan(0.05)
    const last = path[path.length - 1]
    expect(Math.hypot(last.x - 2, last.y + 1)).toBeLessThan(0.1)
  })
})

describe("the playground's controller model", () => {
  it('turns on the spot when the goal is behind, and drives when facing it', () => {
    expect(command({ x: 0, y: 0, yaw: 0 }, -1, 0, DEFAULTS).v).toBe(0)
    expect(command({ x: 0, y: 0, yaw: 0 }, 2, 0, DEFAULTS).v).toBe(DEFAULTS.maxSpeed)
  })

  it('reaches the recorded goal, along a path close to the recorded one', () => {
    const sim = runGoTo({ x: 0, y: 0, yaw: 0 }, 2, -1)
    expect(sim.reached).toBe(true)
    const end = sim.path[sim.path.length - 1].pose
    expect(Math.hypot(end.x - 2, end.y + 1)).toBeLessThan(DEFAULTS.tolerance + 0.01)
    // Every recorded point lies near the simulated path.
    for (const p of path) {
      const nearest = Math.min(...sim.path.map(({ pose }) => Math.hypot(pose.x - p.x, pose.y - p.y)))
      expect(nearest).toBeLessThan(0.15)
    }
  })
})

describe('the Lesson 17 capstone', () => {
  it('the checker fails without go_to and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 8 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 8 checks passed\.$/)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['/go_to', 'SUCCEEDED', '/odom, /cmd_vel, /cmd_vel_in', '8']
    const wrong = ['/speed_limiter', 'CANCELED', '/odom, /cmd_vel_limited', '7']
    lesson17Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
