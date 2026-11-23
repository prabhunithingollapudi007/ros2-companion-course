// Frames on a flat floor, for the Lesson 8 playgrounds: a pose is a position and a
// heading, the way a robot on the ground moves. lesson08.test.ts checks this model
// against tf2_echo, view_frames and where_is as recorded in the container.

export interface Pose {
  x: number
  y: number
  yaw: number
}

/** Where `child`'s frame is in the grandparent's frame, given parent-in-grandparent and child-in-parent. */
export function compose(a: Pose, b: Pose): Pose {
  return {
    x: a.x + Math.cos(a.yaw) * b.x - Math.sin(a.yaw) * b.y,
    y: a.y + Math.sin(a.yaw) * b.x + Math.cos(a.yaw) * b.y,
    yaw: a.yaw + b.yaw,
  }
}

/** The same transform looked at from the other end: parent-in-child instead of child-in-parent. */
export function invert(a: Pose): Pose {
  const c = Math.cos(a.yaw)
  const s = Math.sin(a.yaw)
  return { x: -(c * a.x + s * a.y), y: -(-s * a.x + c * a.y), yaw: -a.yaw }
}

/** A point given in the child frame, expressed in the parent frame. */
export function apply(a: Pose, p: { x: number; y: number }) {
  return { x: a.x + Math.cos(a.yaw) * p.x - Math.sin(a.yaw) * p.y, y: a.y + Math.sin(a.yaw) * p.x + Math.cos(a.yaw) * p.y }
}

/** An angle in (-π, π]. */
export const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

// ---------- Quaternions ----------

export interface Quaternion {
  x: number
  y: number
  z: number
  w: number
}

/** The quaternion for roll, pitch and yaw about the fixed x, y and z axes, as tf2::Quaternion::setRPY computes it. */
export function fromRPY(roll: number, pitch: number, yaw: number): Quaternion {
  const [cr, sr] = [Math.cos(roll / 2), Math.sin(roll / 2)]
  const [cp, sp] = [Math.cos(pitch / 2), Math.sin(pitch / 2)]
  const [cy, sy] = [Math.cos(yaw / 2), Math.sin(yaw / 2)]
  return {
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
    w: cr * cp * cy + sr * sp * sy,
  }
}

/** Roll, pitch and yaw back from a unit quaternion. */
export function toRPY(q: Quaternion): [number, number, number] {
  const roll = Math.atan2(2 * (q.w * q.x + q.y * q.z), 1 - 2 * (q.x * q.x + q.y * q.y))
  const pitch = Math.asin(Math.max(-1, Math.min(1, 2 * (q.w * q.y - q.z * q.x))))
  const yaw = Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z))
  return [roll, pitch, yaw]
}

/** The rotation matrix of a unit quaternion; its columns are the rotated frame's x, y and z axes. */
export function matrix(q: Quaternion): number[][] {
  const { x, y, z, w } = q
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
    [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
    [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
  ]
}

// ---------- The Lesson 8 world: frames_demo and the lab ----------

/** map -> odom in rover_world.launch.py and lab_world.py. */
export const MAP_TO_ODOM: Pose = { x: 0.5, y: -0.2, yaw: 0.3 }
/** base_link -> camera, from the rover's URDF with the camera facing forward. */
export const BASE_TO_CAMERA: Pose = { x: 0.15, y: 0, yaw: 0 }
export const CAMERA_HEIGHT = 0.07
export const CIRCLE = { radius: 1, turnRate: 0.5 }
/** Where the lab's object stands in the map frame, and how late its detections arrive. */
export const LAB_OBJECT = { x: 2, y: 1 }
export const LAB_DELAY = 0.3

/** odom -> base_link, t seconds after circle_broadcaster started. */
export function robotInOdom(t: number): Pose {
  const yaw = CIRCLE.turnRate * t
  return { x: CIRCLE.radius * Math.sin(yaw), y: CIRCLE.radius * (1 - Math.cos(yaw)), yaw }
}

/** map -> camera at time t: the three transforms of the tree, chained. */
export const cameraInMap = (t: number, mapToOdom = MAP_TO_ODOM) => compose(compose(mapToOdom, robotInOdom(t)), BASE_TO_CAMERA)

/** What the lab's camera reports at time t: the object in the camera frame. */
export const detectionAt = (t: number) => apply(invert(cameraInMap(t)), LAB_OBJECT)

/** Where a detection made at `seen` lands on the map if it is transformed with the camera's pose at `used`. */
export const placedOnMap = (seen: number, used: number) => apply(cameraInMap(used), detectionAt(seen))
