import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { REQUIREMENTS, buildGraph, type Requirement } from '../../ros/design'
import '../playgrounds.css'

// Where each node sits: commands flow left to right, to the simulation.
const PLACE: Record<string, [number, number]> = {
  'your client': [120, 300],
  teleop_twist_keyboard: [120, 50],
  go_to: [120, 190],
  speed_limiter: [370, 120],
  cmd_watchdog: [590, 120],
  'gazebo + bridge': [800, 120],
  robot_state_publisher: [800, 270],
  rviz2: [560, 300],
}

export function RequirementsGraphPlayground() {
  const [chosen, setChosen] = useState<Requirement[]>(['sim', 'teleop', 'limit'])
  const { nodes, edges } = buildGraph(chosen)
  const toggle = (r: Requirement) => setChosen((c) => (c.includes(r) ? c.filter((x) => x !== r) : [...c, r]))

  return (
    <Playground
      title="A requirements list turning into a graph"
      caption={
        <>
          Each requirement brings its nodes and its connections. The command chain follows the names this lesson&apos;s
          launch files use: whatever gives commands publishes <code>/cmd_vel_in</code>, the robot obeys <code>/cmd_vel</code>,
          and each safety stage sits in between, renamed by remapping, without changing its code.
        </>
      }
    >
      <div className="req-list">
        {REQUIREMENTS.map((r) => (
          <label key={r.id}>
            <input type="checkbox" checked={chosen.includes(r.id)} onChange={() => toggle(r.id)} />
            {r.text}
          </label>
        ))}
      </div>
      <div className="figure-scroll">
        <svg viewBox="0 0 920 340" className="graph-svg" style={{ minWidth: 640 }} role="img" aria-label={`${nodes.length} nodes: ${nodes.join(', ')}. ${edges.map((e) => `${e.from} to ${e.to} on ${e.topic}`).join('; ')}.`}>
          <defs>
            <marker id="req-arrow" markerWidth={10} markerHeight={10} refX={8.5} refY={5} orient="auto">
              <path d="M0,1 L9,5 L0,9 Z" className="fig-fill-s1" />
            </marker>
          </defs>
          {edges.map((e) => {
            const [x1, y1] = PLACE[e.from]
            const [x2, y2] = PLACE[e.to]
            const dx = x2 - x1
            const dy = y2 - y1
            const len = Math.hypot(dx, dy) || 1
            const pad = 70
            const sx = x1 + (dx / len) * Math.min(pad, len / 3)
            const sy = y1 + (dy / len) * 22
            const ex = x2 - (dx / len) * Math.min(pad, len / 3)
            const ey = y2 - (dy / len) * 22
            return (
              <g key={`${e.from}-${e.to}`}>
                <line x1={sx} y1={sy} x2={ex} y2={ey} className={e.kind === 'action' ? 'fig-line-s2' : 'fig-line-s1'} markerEnd="url(#req-arrow)" />
                <text x={sx + (ex - sx) * 0.45} y={sy + (ey - sy) * 0.45 - 7} textAnchor="middle" className="fig-small">
                  {e.topic}
                </text>
              </g>
            )
          })}
          {nodes.map((n) => {
            const [x, y] = PLACE[n]
            return (
              <g key={n}>
                <ellipse cx={x} cy={y} rx={n.length * 3.6 + 16} ry={19} className={n === 'gazebo + bridge' ? 'fig-node-accent' : 'fig-node'} />
                <text x={x} y={y + 4.5} textAnchor="middle" className="fig-mono">
                  {n}
                </text>
              </g>
            )
          })}
          {nodes.length === 0 && (
            <text x={460} y={170} textAnchor="middle" className="fig-small">
              Choose some requirements above.
            </text>
          )}
        </svg>
      </div>
    </Playground>
  )
}
