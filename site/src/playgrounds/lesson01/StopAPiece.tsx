import { useMemo, useState } from 'react'
import { Playground } from '../../components/Playground'
import { arrow } from '../../figures/arrows'
import { LINE_FOLLOWER, flow, type NodeState } from '../../ros/dataflow'
import '../playgrounds.css'

// Positions match Lesson 2's drawing of the same robot.
const POS: Record<string, { x: number; y: number }> = {
  camera_driver: { x: 104, y: 70 },
  line_detector: { x: 360, y: 70 },
  steering: { x: 616, y: 70 },
  recorder: { x: 360, y: 200 },
  motor_driver: { x: 616, y: 200 },
}

const EDGES: { from: string; to: string; topic: string; d: string; lx: number; ly: number }[] = [
  { from: 'camera_driver', to: 'line_detector', topic: '/image', d: 'M184,70 H278', lx: 231, ly: 60 },
  { from: 'line_detector', to: 'steering', topic: '/line_offset', d: 'M440,70 H534', lx: 487, ly: 60 },
  { from: 'camera_driver', to: 'recorder', topic: '/image', d: 'M104,94 V200 H278', lx: 192, ly: 190 },
  { from: 'steering', to: 'motor_driver', topic: '/cmd_vel', d: 'M616,94 V174', lx: 604, ly: 140 },
]

const WORDS: Record<NodeState, string> = { running: 'running', waiting: 'running, nothing arriving', stopped: 'stopped' }

export function StopAPiece() {
  const [stopped, setStopped] = useState<Set<string>>(() => new Set())
  const [monolith, setMonolith] = useState(false)
  const result = useMemo(() => flow(LINE_FOLLOWER, stopped, monolith), [stopped, monolith])

  const toggle = (name: string) =>
    setStopped((s) => {
      const next = new Set(s)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  const counts = { running: 0, waiting: 0, stopped: 0 }
  for (const s of Object.values(result.state)) counts[s] += 1

  return (
    <Playground
      title="Stop one piece"
      caption={
        <>
          Click a node to stop it, and again to start it. In a ROS graph each node is its own program, so stopping one
          leaves the others running: those further along simply stop receiving, and pick up again as soon as it is back.
          Switch to <em>one big program</em> to see the alternative, where any failure takes everything down. The ROS
          behaviour here is the one recorded above with the demo talker and listener.
        </>
      }
    >
      <div className="button-row">
        <button type="button" className={`btn btn-small ${monolith ? '' : 'btn-primary'}`} aria-pressed={!monolith} onClick={() => setMonolith(false)}>
          Separate nodes (ROS)
        </button>
        <button type="button" className={`btn btn-small ${monolith ? 'btn-primary' : ''}`} aria-pressed={monolith} onClick={() => setMonolith(true)}>
          One big program
        </button>
        <button type="button" className="btn btn-quiet btn-small" onClick={() => setStopped(new Set())} disabled={stopped.size === 0}>
          Start everything
        </button>
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 260" className="graph-svg" role="img" aria-label={`${counts.running} nodes working, ${counts.waiting} waiting for input, ${counts.stopped} stopped.`}>
          {monolith && <rect x={14} y={24} width={692} height={214} rx={14} className="fig-box fig-dash" />}
          {monolith && (
            <text x={30} y={44} className="fig-label">
              one process
            </text>
          )}
          {EDGES.map((e) => {
            const flowing = result.live.has(e.topic) && result.state[e.to] !== 'stopped'
            return (
              <g key={e.d}>
                <path d={e.d} className={flowing ? 'edge-live' : 'edge-dead'} markerEnd={arrow(flowing ? 's1' : 'muted')} />
                <text x={e.lx} y={e.ly} textAnchor={e.lx < 200 ? 'middle' : e.lx > 600 ? 'end' : 'middle'} className={`edge-type ${flowing ? '' : 'is-dead'}`}>
                  {e.topic}
                </text>
                {flowing && (
                  <circle r={5} className="msg-dot">
                    <animateMotion dur="1.2s" repeatCount="indefinite" path={e.d} />
                  </circle>
                )}
              </g>
            )
          })}
          {LINE_FOLLOWER.map((n) => {
            const p = POS[n.name]
            const s = result.state[n.name]
            return (
              <g
                key={n.name}
                className="clickable-node"
                role="button"
                tabIndex={0}
                aria-label={`/${n.name}: ${WORDS[s]}. Press to ${stopped.has(n.name) ? 'start' : 'stop'} it.`}
                onClick={() => toggle(n.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle(n.name)
                  }
                }}
              >
                <ellipse cx={p.x} cy={p.y} rx={80} ry={24} className={s === 'running' ? 'fig-node-accent' : s === 'stopped' ? 'fig-node-warn' : 'fig-node'} />
                <text x={p.x} y={p.y + 4.5} textAnchor="middle" className="fig-mono">
                  /{n.name}
                </text>
                <text x={p.x} y={p.y + 42} textAnchor="middle" className={s === 'stopped' ? 'topic-warning' : 'fig-small'}>
                  {WORDS[s]}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Working</div>
          <div className="stat-value">{counts.running}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Running, waiting for input</div>
          <div className="stat-value">{counts.waiting}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Stopped</div>
          <div className="stat-value">{counts.stopped}</div>
        </div>
      </div>
    </Playground>
  )
}
