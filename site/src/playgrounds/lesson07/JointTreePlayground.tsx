import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { ROVER, ROVER_JOINTS, jointStateText, sliderRange } from '../../ros/rover'
import '../playgrounds.css'

const S = 380 // pixels per metre
const deg = (r: number) => (r * 180) / Math.PI

// Top view: x (forward) points up the page, y (left) to the left.
const TOP = { cx: 190, cy: 185 }
const top = (x: number, y: number) => [TOP.cx - y * S, TOP.cy - x * S] as const
// Side view from the robot's right: x to the right, z up.
const SIDE = { cx: 540, cy: 170 }
const side = (x: number, z: number) => [SIDE.cx + x * S, SIDE.cy - z * S] as const

const CAMERA = { x: ROVER.baseLength / 2 - 0.05, z: ROVER.baseHeight / 2 + 0.02, sx: 0.04, sy: 0.1 }
const WHEEL_Y = ROVER.baseWidth / 2 + ROVER.wheelWidth / 2
const CASTER_X = -ROVER.baseLength / 2 + ROVER.casterRadius

export function JointTreePlayground() {
  const [q, setQ] = useState<Record<string, number>>({ left_wheel_joint: 0, right_wheel_joint: 0, camera_pan: 0 })
  const set = (name: string) => (v: number) => setQ((old) => ({ ...old, [name]: v }))
  const pan = q.camera_pan

  const [bx, by] = top(ROVER.baseLength / 2, ROVER.baseWidth / 2)
  const [camX, camY] = top(CAMERA.x, 0)
  // The camera's view: a cone along its own x axis, which camera_pan turns about z.
  const ray = (a: number) => [camX - Math.sin(pan + a) * 0.2 * S, camY - Math.cos(pan + a) * 0.2 * S]
  const [r1x, r1y] = ray(0.45)
  const [r2x, r2y] = ray(-0.45)

  const wheel = (name: 'left_wheel_joint' | 'right_wheel_joint', dashed: boolean) => {
    const [x0, z0] = side(ROVER.wheelX, 0)
    // The far wheel is drawn a little up and to the right, as if seen slightly from above, so it shows.
    const [wx, wz] = dashed ? [x0 + 16, z0 - 12] : [x0, z0]
    const a = q[name]
    const r = ROVER.wheelRadius * S
    return (
      <g className={dashed ? 'fig-faded' : undefined}>
        <circle cx={wx} cy={wz} r={r} className={dashed ? 'fig-dash' : 'fig-box'} />
        {/* Seen from the right, the wheel axis (+y) points away from you, so a positive angle turns it clockwise. */}
        <line x1={wx} y1={wz} x2={wx + Math.sin(a) * r} y2={wz - Math.cos(a) * r} className={dashed ? 'fig-line-s2' : 'fig-line-s1'} />
      </g>
    )
  }

  const camHalf = (Math.abs(Math.cos(pan)) * CAMERA.sx + Math.abs(Math.sin(pan)) * CAMERA.sy) / 2
  const [sbx, sby] = side(-ROVER.baseLength / 2, ROVER.baseHeight / 2)
  const [scx, scy] = side(CAMERA.x - camHalf, CAMERA.z + 0.02)
  const [ccx, ccy] = side(CASTER_X, -ROVER.wheelRadius + ROVER.casterRadius)

  return (
    <Playground
      title="A joint tree you can move"
      caption={
        <>
          The rover from <code>rover.urdf.xacro</code>, drawn from its own numbers. One slider per movable joint, with the
          ranges <code>joint_state_publisher_gui</code> gives them: the camera&apos;s limits of ±90°, and a full turn for each
          wheel. The caster&apos;s joint is fixed, so it gets no slider. On the right, the message those sliders publish.
        </>
      }
    >
      <div className="controls controls-3">
        {ROVER_JOINTS.filter((j) => j.type !== 'fixed').map((j) => {
          const [lo, hi] = sliderRange(j.type)!
          return (
            <Slider
              key={j.name}
              label={
                <>
                  <code>{j.name}</code> ({j.type})
                </>
              }
              value={q[j.name]}
              min={lo}
              max={hi}
              step={0.01}
              onChange={set(j.name)}
              format={(v) => `${v.toFixed(2)} rad, ${deg(v).toFixed(0)}°`}
            />
          )
        })}
      </div>

      <div className="joint-tree-layout">
        <div className="figure-scroll">
          <svg viewBox="0 0 720 320" className="graph-svg" role="img" aria-label={`Top and side views of the rover. The camera is turned ${deg(pan).toFixed(0)} degrees; the wheels are at ${q.left_wheel_joint.toFixed(2)} and ${q.right_wheel_joint.toFixed(2)} radians.`}>
            <text x={20} y={22} className="fig-label">
              From above (forward is up)
            </text>
            <text x={400} y={22} className="fig-label">
              From the right side (forward is right)
            </text>

            {/* Top view */}
            <rect x={bx} y={by} width={ROVER.baseWidth * S} height={ROVER.baseLength * S} rx={4} className="fig-box-accent" />
            {[1, -1].map((s) => {
              const [wx, wy] = top(ROVER.wheelX + ROVER.wheelRadius, s * WHEEL_Y + ROVER.wheelWidth / 2)
              return <rect key={s} x={wx} y={wy} width={ROVER.wheelWidth * S} height={2 * ROVER.wheelRadius * S} rx={3} className="fig-fill-ink" />
            })}
            <circle cx={top(CASTER_X, 0)[0]} cy={top(CASTER_X, 0)[1]} r={ROVER.casterRadius * S} className="fig-box" />
            <path d={`M${camX},${camY} L${r1x},${r1y} L${r2x},${r2y} Z`} className="col-band" />
            <rect
              x={camX - (CAMERA.sy * S) / 2}
              y={camY - (CAMERA.sx * S) / 2}
              width={CAMERA.sy * S}
              height={CAMERA.sx * S}
              rx={2}
              className="fig-fill-s2"
              transform={`rotate(${-deg(pan)} ${camX} ${camY})`}
            />
            <text x={top(ROVER.wheelX, WHEEL_Y)[0] - 14} y={top(ROVER.wheelX, WHEEL_Y)[1] + 4} textAnchor="end" className="fig-small">
              left
            </text>
            <text x={top(ROVER.wheelX, -WHEEL_Y)[0] + 14} y={top(ROVER.wheelX, -WHEEL_Y)[1] + 4} className="fig-small">
              right
            </text>
            <text x={top(CASTER_X, 0)[0]} y={top(CASTER_X, 0)[1] + 32} textAnchor="middle" className="fig-small">
              caster
            </text>

            {/* Side view */}
            {wheel('left_wheel_joint', true)}
            <rect x={sbx} y={sby} width={ROVER.baseLength * S} height={ROVER.baseHeight * S} rx={4} className="fig-box-accent" />
            <circle cx={ccx} cy={ccy} r={ROVER.casterRadius * S} className="fig-box" />
            <rect x={scx} y={scy} width={camHalf * 2 * S} height={CAMERA.sx * S} rx={2} className="fig-fill-s2" />
            {wheel('right_wheel_joint', false)}
            <line x1={side(-0.3, -ROVER.wheelRadius)[0]} y1={side(0, -ROVER.wheelRadius)[1]} x2={side(0.3, 0)[0]} y2={side(0, -ROVER.wheelRadius)[1]} className="fig-line-muted" />
            <text x={side(ROVER.wheelX, 0)[0]} y={side(0, -ROVER.wheelRadius)[1] + 22} textAnchor="middle" className="fig-small">
              right wheel in front, left wheel dashed behind
            </text>
          </svg>
        </div>
        <pre className="joint-state-msg" aria-label="The /joint_states message">
          {jointStateText(q)}
        </pre>
      </div>
    </Playground>
  )
}
