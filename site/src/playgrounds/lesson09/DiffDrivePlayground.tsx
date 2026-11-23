import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { ROVER_DRIVE, bodySpeeds, drive, turnRadius } from '../../ros/diffdrive'
import '../playgrounds.css'

const SECONDS = 6
const S = 90 // pixels per metre
const O = { x: 120, y: 200 }
const px = (p: { x: number; y: number }) => [O.x + p.x * S, O.y - p.y * S] as const
const f2 = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2)

export function DiffDrivePlayground() {
  const [left, setLeft] = useState(4)
  const [right, setRight] = useState(6)
  const { v, w } = bodySpeeds(ROVER_DRIVE, left, right)
  const start = { x: 0, y: 0, yaw: 0 }
  const path = Array.from({ length: 61 }, (_, i) => px(drive(start, v, w, (i / 60) * SECONDS)))
  const end = drive(start, v, w, SECONDS)
  const [ex, ey] = px(end)
  const radius = turnRadius(v, w)

  return (
    <Playground
      title="Differential drive: from wheel speeds to motion"
      caption={
        <>
          The rover&apos;s two wheels, 0.34 m apart with a radius of 0.08 m, set to turn at fixed speeds; the line is where
          the robot goes in {SECONDS} s, starting at the cross and heading right. Equal speeds drive straight; unequal ones
          drive a circle; opposite ones turn on the spot. Gazebo&apos;s DiffDrive system works the other way round: given the{' '}
          <code>/cmd_vel</code> on the right, it sets the wheel speeds on the left.
        </>
      }
    >
      <div className="controls">
        <Slider label="Left wheel" value={left} min={-10} max={10} step={0.5} onChange={setLeft} format={(x) => `${x.toFixed(1)} rad/s`} />
        <Slider label="Right wheel" value={right} min={-10} max={10} step={0.5} onChange={setRight} format={(x) => `${x.toFixed(1)} rad/s`} />
      </div>
      <div className="joint-tree-layout">
        <div className="figure-scroll">
          <svg viewBox="0 0 720 400" className="graph-svg" role="img" aria-label={`In ${SECONDS} seconds the robot ends at x ${f2(end.x)}, y ${f2(end.y)} metres.`}>
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`v${i}`} x1={O.x + (i - 1) * S} y1={10} x2={O.x + (i - 1) * S} y2={390} className="fig-line-muted" opacity={0.3} />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <line key={`h${i}`} x1={10} y1={O.y + (i - 2) * S} x2={710} y2={O.y + (i - 2) * S} className="fig-line-muted" opacity={0.3} />
            ))}
            <path d={`M${O.x - 8},${O.y} h16 M${O.x},${O.y - 8} v16`} className="fig-line" />
            <polyline points={path.map((p) => p.join(',')).join(' ')} fill="none" className="fig-line-s1" />
            <g transform={`translate(${ex} ${ey}) rotate(${(-end.yaw * 180) / Math.PI})`}>
              <rect x={-18} y={-13.5} width={36} height={27} rx={3} className="fig-box-accent" />
              <rect x={-2} y={-17} width={14} height={4} className="fig-fill-ink" />
              <rect x={-2} y={13} width={14} height={4} className="fig-fill-ink" />
              <line x1={0} y1={0} x2={26} y2={0} className="fig-line-s2" />
            </g>
            <text x={20} y={384} className="fig-small">
              grid: 1 m
            </text>
          </svg>
        </div>
        <pre className="joint-state-msg" aria-label="The /cmd_vel message for this motion">
          {[
            '/cmd_vel:',
            'linear:',
            `  x: ${f2(v)}`,
            '  y: 0.0',
            '  z: 0.0',
            'angular:',
            '  x: 0.0',
            '  y: 0.0',
            `  z: ${f2(w)}`,
            '',
            `speed ${f2(v)} m/s`,
            `turning ${f2(w)} rad/s`,
            Number.isFinite(radius) ? `circle radius ${f2(Math.abs(radius))} m` : 'straight line',
          ].join('\n')}
        </pre>
      </div>
    </Playground>
  )
}
