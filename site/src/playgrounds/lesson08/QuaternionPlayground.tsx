import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { fromRPY, matrix, toRPY } from '../../ros/frames'
import '../playgrounds.css'

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
const f4 = (v: number) => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(4)

// A fixed oblique view of 3D space: x towards the viewer and left, y to the right, z up.
const C = { x: 160, y: 150 }
const L = 100
const view = (v: number[]) => [C.x + L * (v[1] - 0.55 * v[0]), C.y - L * (v[2] - 0.35 * v[0])] as const

export function QuaternionPlayground() {
  const [roll, setRoll] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [yaw, setYaw] = useState(17)
  const q = fromRPY(rad(roll), rad(pitch), rad(yaw))
  const m = matrix(q)
  const back = toRPY(q)
  const axes = [0, 1, 2].map((c) => [m[0][c], m[1][c], m[2][c]])
  const norm = Math.hypot(q.x, q.y, q.z, q.w)

  return (
    <Playground
      title="Quaternions and roll, pitch, yaw"
      caption={
        <>
          The same rotation as three angles and as the quaternion that transforms carry. Roll, pitch and yaw turn about the
          fixed x, y and z axes in that order, as <code>static_transform_publisher</code> and <code>setRPY</code> take them.
          Set yaw to 17° (0.3 rad) for the map → odom transform above: only z and w are non-zero.
        </>
      }
    >
      <div className="controls controls-3">
        <Slider label="Roll, about x" value={roll} min={-180} max={180} step={1} onChange={setRoll} format={(v) => `${v}°`} />
        <Slider label="Pitch, about y" value={pitch} min={-90} max={90} step={1} onChange={setPitch} format={(v) => `${v}°`} />
        <Slider label="Yaw, about z" value={yaw} min={-180} max={180} step={1} onChange={setYaw} format={(v) => `${v}°`} />
      </div>
      <div className="joint-tree-layout">
        <div className="figure-scroll">
          <svg viewBox="0 0 330 290" className="graph-svg" style={{ minWidth: 0, maxWidth: 360, margin: '0 auto' }} role="img" aria-label="The rotated frame's x, y and z axes, drawn over the fixed ones.">
            {[
              [1, 0, 0],
              [0, 1, 0],
              [0, 0, 1],
            ].map((v, i) => {
              const [x, y] = view(v)
              return <line key={i} x1={C.x} y1={C.y} x2={x} y2={y} className="fig-line-muted fig-dash" />
            })}
            {axes.map((v, i) => {
              const [x, y] = view(v)
              return (
                <g key={i}>
                  <line x1={C.x} y1={C.y} x2={x} y2={y} className={['fig-line-s2', 'fig-line-s3', 'fig-line-s1'][i]} strokeWidth={3} />
                  <text x={x + (x < C.x ? -6 : 6)} y={y - 4} textAnchor={x < C.x ? 'end' : 'start'} className="fig-mono-strong">
                    {'xyz'[i]}
                  </text>
                </g>
              )
            })}
            <text x={10} y={280} className="fig-small">
              dashed: the parent frame; solid: the rotated one
            </text>
          </svg>
        </div>
        <pre className="joint-state-msg" aria-label="The quaternion">
          {[
            'rotation:',
            `  x: ${f4(q.x)}`,
            `  y: ${f4(q.y)}`,
            `  z: ${f4(q.z)}`,
            `  w: ${f4(q.w)}`,
            '',
            `length ${norm.toFixed(4)}`,
            '',
            'back to roll, pitch, yaw:',
            `  ${back.map((a) => `${deg(a).toFixed(0)}°`).join(', ')}`,
          ].join('\n')}
        </pre>
      </div>
    </Playground>
  )
}
