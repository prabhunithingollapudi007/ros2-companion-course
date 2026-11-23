// A differential-drive robot, for the Lesson 9 playgrounds: two driven wheels on
// one axle, the way Gazebo's DiffDrive system moves the rover. lesson09.test.ts
// checks it against odometry recorded from the simulation.

export interface DiffDrive {
  /** Distance between the two wheels' centres, metres. */
  separation: number
  /** Wheel radius, metres. */
  radius: number
}

/** The rover of Lessons 7 to 9: wheels 0.34 m apart (0.30 m body plus two half widths), radius 0.08 m. */
export const ROVER_DRIVE: DiffDrive = { separation: 0.34, radius: 0.08 }

/** How fast each wheel must turn, in radians per second, to drive at v m/s while turning at w rad/s. */
export function wheelSpeeds(d: DiffDrive, v: number, w: number) {
  return { left: (v - (w * d.separation) / 2) / d.radius, right: (v + (w * d.separation) / 2) / d.radius }
}

/** The robot's speed and turn rate from its wheels' speeds: the other direction. */
export function bodySpeeds(d: DiffDrive, left: number, right: number) {
  return { v: (d.radius * (left + right)) / 2, w: (d.radius * (right - left)) / d.separation }
}

export interface Pose2 {
  x: number
  y: number
  yaw: number
}

/** Where the robot is after driving at v and w for t seconds from `start`: an arc, or a straight line when w is 0. */
export function drive(start: Pose2, v: number, w: number, t: number): Pose2 {
  if (Math.abs(w) < 1e-9) return { x: start.x + v * t * Math.cos(start.yaw), y: start.y + v * t * Math.sin(start.yaw), yaw: start.yaw }
  const yaw = start.yaw + w * t
  return {
    x: start.x + (v / w) * (Math.sin(yaw) - Math.sin(start.yaw)),
    y: start.y - (v / w) * (Math.cos(yaw) - Math.cos(start.yaw)),
    yaw,
  }
}

/** The radius of the circle the robot drives, or Infinity when it drives straight. */
export const turnRadius = (v: number, w: number) => (Math.abs(w) < 1e-9 ? Infinity : v / w)
