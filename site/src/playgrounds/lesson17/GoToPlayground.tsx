import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { runGoTo } from '../../ros/goto'
import '../playgrounds.css'

const S = 90
const O = { x: 160, y: 230 }
const px = (x: number, y: number) => [O.x + x * S, O.y - y * S] as const

/** The arena's crates, in the odom frame (the rover starts at the world's origin, facing x). */
const CRATES = [
  { x: 3, y: 0.5, yaw: 0 },
  { x: 2, y: 2, yaw: 0.6 },
]

export function GoToPlayground({ recorded }: { recorded?: { x: number; y: number }[] }) {
  const [gx, setGx] = useState(2)
  const [gy, setGy] = useState(-1)
  const [maxSpeed, setMaxSpeed] = useState(0.5)
  const [maxTurn, setMaxTurn] = useState(1)
  const run = runGoTo({ x: 0, y: 0, yaw: 0 }, gx, gy, { maxSpeed, maxTurn, tolerance: 0.1 })
  const points = run.path.map(({ pose }) => px(pose.x, pose.y).join(',')).join(' ')
  const showRecorded = recorded && gx === 2 && gy === -1 && maxSpeed === 0.5 && maxTurn === 1

  return (
    <Playground
      title="The go_to controller, simulated"
      caption={
        <>
          The reference go_to&apos;s rule, run on the differential-drive model of Lesson 9: turn towards the goal at up to
          max_turn, drive only when facing within 0.3 rad of it, slow down near it, stop within 0.1 m. With the settings of
          capstone.yaml and the goal (2, −1), the orange dashes are the path recorded in the bag in Gazebo, on top of the simulated one.
        </>
      }
    >
      <div className="controls">
        <Slider label="Goal x" value={gx} min={-1} max={4} step={0.5} onChange={setGx} format={(v) => `${v.toFixed(1)} m`} />
        <Slider label="Goal y" value={gy} min={-1.5} max={2.5} step={0.5} onChange={setGy} format={(v) => `${v.toFixed(1)} m`} />
        <Slider label="max_speed" value={maxSpeed} min={0.1} max={0.8} step={0.1} onChange={setMaxSpeed} format={(v) => `${v.toFixed(1)} m/s`} />
        <Slider label="max_turn" value={maxTurn} min={0.2} max={2} step={0.1} onChange={setMaxTurn} format={(v) => `${v.toFixed(1)} rad/s`} />
      </div>
      <div className="figure-scroll">
        <svg viewBox="0 0 720 390" className="graph-svg" role="img" aria-label={`The rover ${run.reached ? 'reaches' : 'does not reach'} the goal in ${run.seconds.toFixed(1)} seconds.`}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={O.x + (i - 1) * S} y1={10} x2={O.x + (i - 1) * S} y2={380} className="fig-line-muted" opacity={0.3} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={10} y1={O.y + (i - 2) * S} x2={710} y2={O.y + (i - 2) * S} className="fig-line-muted" opacity={0.3} />
          ))}
          {CRATES.map((c) => {
            const [cx, cy] = px(c.x, c.y)
            return <rect key={c.x} x={cx - 0.25 * S} y={cy - 0.25 * S} width={0.5 * S} height={0.5 * S} className="fig-fill-s2" opacity={0.6} transform={`rotate(${(-c.yaw * 180) / Math.PI} ${cx} ${cy})`} />
          })}
          <polyline points={points} fill="none" className="fig-line-s1" />
          {showRecorded && (
            <polyline points={recorded!.map((p) => px(p.x, p.y).join(',')).join(' ')} fill="none" className="fig-line-s2 fig-dash" style={{ strokeWidth: 3 }} />
          )}
          <circle cx={px(0, 0)[0]} cy={px(0, 0)[1]} r={5} className="fig-fill-ink" />
          <circle cx={px(gx, gy)[0]} cy={px(gx, gy)[1]} r={0.1 * S} className="fig-dash fig-line-s1" fill="none" />
          <path d={`M${px(gx, gy)[0] - 6},${px(gx, gy)[1]} h12 M${px(gx, gy)[0]},${px(gx, gy)[1] - 6} v12`} className="fig-line" />
          <text x={20} y={384} className="fig-small">
            grid: 1 m; orange: crates; go_to drives straight through them, as it knows nothing of obstacles
          </text>
        </svg>
      </div>
      <div className="cards">
        <div className="card">
          <div className="card-title">Arrives</div>
          <div className="card-value">{run.reached ? `after ${run.seconds.toFixed(1)} s` : 'not within 60 s'}</div>
          <div className="card-note">simulated, at 20 commands a second</div>
        </div>
      </div>
    </Playground>
  )
}
