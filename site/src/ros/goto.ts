// The capstone's go_to controller, for the Lesson 17 playground: the same rule as
// labs/lesson17/solution/go_to, driving the differential-drive model of Lesson 9.
// lesson17.test.ts checks it reaches its goals, and compares it with the path
// recorded in the bag.

import { drive, type Pose2 } from './diffdrive'

export interface GoToParams {
  maxSpeed: number
  maxTurn: number
  tolerance: number
}

export const DEFAULTS: GoToParams = { maxSpeed: 0.5, maxTurn: 1.0, tolerance: 0.1 }

/** The command go_to sends from pose `p` towards (gx, gy): turn to face the goal, drive when roughly facing it. */
export function command(p: Pose2, gx: number, gy: number, k: GoToParams) {
  const distance = Math.hypot(gx - p.x, gy - p.y)
  const headingError = Math.atan2(Math.sin(Math.atan2(gy - p.y, gx - p.x) - p.yaw), Math.cos(Math.atan2(gy - p.y, gx - p.x) - p.yaw))
  const w = Math.max(-k.maxTurn, Math.min(k.maxTurn, 2 * headingError))
  const v = Math.abs(headingError) < 0.3 ? Math.min(k.maxSpeed, 0.8 * distance) : 0
  return { v, w, distance, headingError }
}

/** The poses go_to drives through from `start` to (gx, gy), at 20 commands a second, until it arrives or `limit` seconds pass. */
export function runGoTo(start: Pose2, gx: number, gy: number, k: GoToParams = DEFAULTS, limit = 60) {
  const dt = 0.05
  const path: { t: number; pose: Pose2 }[] = [{ t: 0, pose: start }]
  let p = start
  for (let t = dt; t <= limit + 1e-9; t += dt) {
    const c = command(p, gx, gy, k)
    if (c.distance < k.tolerance) return { path, reached: true, seconds: t - dt }
    p = drive(p, c.v, c.w, dt)
    path.push({ t, pose: p })
  }
  return { path, reached: false, seconds: limit }
}
