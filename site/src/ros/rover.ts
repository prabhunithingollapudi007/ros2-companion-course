// The Lesson 7 rover, as its xacro file describes it, for the playgrounds.
// rover.test.ts checks the numbers against what xacro printed in the container.

export const ROVER = {
  baseLength: 0.4,
  baseWidth: 0.3,
  baseHeight: 0.1,
  baseMass: 4.0,
  wheelRadius: 0.08,
  wheelWidth: 0.04,
  wheelX: 0.1,
  casterRadius: 0.04,
  cameraLimit: Math.PI / 2,
}

export type RoverDims = typeof ROVER

/** What the wheel macro computes for one wheel: its joint origin. */
export function wheelOrigin(d: Pick<RoverDims, 'wheelX' | 'baseWidth' | 'wheelWidth'>, reflect: 1 | -1) {
  return { xyz: [d.wheelX, reflect * (d.baseWidth / 2 + d.wheelWidth / 2), 0], rpy: [-Math.PI / 2, 0, 0] }
}

/** The solid-box inertia the box_inertia macro writes. */
export function boxInertia(m: number, x: number, y: number, z: number) {
  return { ixx: (m * (y * y + z * z)) / 12, iyy: (m * (x * x + z * z)) / 12, izz: (m * (x * x + y * y)) / 12 }
}

/** xacro writes numbers in Python's shortest form; this matches it for the values used here. */
export const pyNumber = (v: number) => {
  if (Number.isInteger(v)) return `${v}.0`
  const s = String(+v.toPrecision(17))
  return s
}

/** The rover's joints, as check_urdf lists them. */
export const ROVER_JOINTS: { name: string; type: 'continuous' | 'fixed' | 'revolute'; child: string }[] = [
  { name: 'left_wheel_joint', type: 'continuous', child: 'left_wheel' },
  { name: 'right_wheel_joint', type: 'continuous', child: 'right_wheel' },
  { name: 'caster_joint', type: 'fixed', child: 'caster' },
  { name: 'camera_pan', type: 'revolute', child: 'camera' },
]

/** A joint position kept within what the joint allows. */
export function clampJoint(type: 'continuous' | 'fixed' | 'revolute', value: number, limit = ROVER.cameraLimit) {
  if (type === 'fixed') return 0
  if (type === 'revolute') return Math.min(Math.max(value, -limit), limit)
  return value
}

/**
 * The range joint_state_publisher_gui gives each joint's slider: a revolute joint's
 * limits, and -π to π for a continuous one. Fixed joints get no slider.
 */
export function sliderRange(type: 'continuous' | 'fixed' | 'revolute', limit = ROVER.cameraLimit): [number, number] | null {
  if (type === 'fixed') return null
  return type === 'revolute' ? [-limit, limit] : [-Math.PI, Math.PI]
}

/** A /joint_states message for the movable joints, as `ros2 topic echo` prints its names and positions. */
export function jointStateText(positions: Record<string, number>) {
  const movable = ROVER_JOINTS.filter((j) => j.type !== 'fixed')
  return [
    'name:',
    ...movable.map((j) => `- ${j.name}`),
    'position:',
    ...movable.map((j) => `- ${pyNumber(Number((positions[j.name] ?? 0).toFixed(2)))}`),
  ].join('\n')
}

/**
 * One call of the rover's wheel macro, expanded the way xacro writes it. With the
 * rover's own numbers this is exactly what `xacro ... | grep -A 6` printed.
 */
export function expandWheelJoint(side: string, reflect: number, d: Pick<RoverDims, 'wheelX' | 'baseWidth' | 'wheelWidth'>) {
  const y = reflect * (d.baseWidth / 2 + d.wheelWidth / 2)
  return [
    `  <joint name="${side}_wheel_joint" type="continuous">`,
    `    <parent link="base_link"/>`,
    `    <child link="${side}_wheel"/>`,
    `    <!-- Turned so the wheel's own z axis, the axis a cylinder is drawn along, points sideways. -->`,
    `    <origin rpy="${pyNumber(-Math.PI / 2)} 0 0" xyz="${pyNumber(d.wheelX)} ${pyNumber(y)} 0"/>`,
    `    <axis xyz="0 0 1"/>`,
    `  </joint>`,
  ].join('\n')
}
