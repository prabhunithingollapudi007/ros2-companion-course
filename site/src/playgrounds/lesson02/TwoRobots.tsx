import { useMemo, useState } from 'react'
import { arrow } from '../../figures/arrows'
import { Playground } from '../../components/Playground'
import { Terminal } from '../../components/Terminal'
import { connections, emptyGraph, nodeList, withPublisher, withSubscriber } from '../../ros/graph'
import '../playgrounds.css'

const TWIST = 'geometry_msgs/msg/Twist'
const DOMAINS = [0, 1, 2, 3]

interface Robot {
  key: 'a' | 'b'
  label: string
  /** Fits inside the robot's box in the drawing. */
  short: string
  x: number
}

const ROBOTS: Robot[] = [
  { key: 'a', label: 'Your robot', short: 'Yours', x: 130 },
  { key: 'b', label: "Your neighbour's robot", short: "Neighbour's", x: 470 },
]

const TELEOP_Y = 92
const MOTORS_Y = 222

export function TwoRobots() {
  const [domain, setDomain] = useState<Record<Robot['key'], number>>({ a: 0, b: 0 })

  const { graph, links } = useMemo(() => {
    let g = emptyGraph()
    for (const r of ROBOTS) {
      g = withPublisher(g, `teleop_${r.key}`, '/cmd_vel', TWIST, domain[r.key])
      g = withSubscriber(g, `motors_${r.key}`, '/cmd_vel', TWIST, domain[r.key])
    }
    return { graph: g, links: connections(g) }
  }, [domain])

  const centre = (key: string) => ROBOTS.find((r) => r.key === key)!.x + 60
  const obeys = (key: string) => links.filter((l) => l.subscription.node === `motors_${key}`).map((l) => l.publisher.node)
  const crossed = links.some((l) => l.publisher.node.slice(-1) !== l.subscription.node.slice(-1))

  return (
    <Playground
      title="Two robots, one network"
      caption={
        <>
          Both robots run the same software: a joystick node publishing <code>/cmd_vel</code> and a motor driver
          subscribing to it. On a shared network in the same domain, each motor driver connects to both joysticks.
          Giving each group its own <code>ROS_DOMAIN_ID</code> splits the graph in two without changing any code. The
          drawing puts both robots in one picture; in practice they are separate computers on the same network.
        </>
      }
    >
      <div className="controls">
        {ROBOTS.map((r) => (
          <label className="select-field" key={r.key}>
            <span className="slider-label">{r.label}: ROS_DOMAIN_ID</span>
            <select value={domain[r.key]} onChange={(e) => setDomain((d) => ({ ...d, [r.key]: Number(e.target.value) }))}>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                  {d === 0 ? ' (the default)' : ''}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="figure-scroll">
        <svg
          viewBox="0 0 720 290"
          className="graph-svg"
          role="img"
          aria-label={
            crossed
              ? 'Both robots are in the same domain, so each motor driver receives commands from both joysticks.'
              : 'The robots are in different domains, so each motor driver receives commands from its own joystick only.'
          }
        >
          {ROBOTS.map((r) => (
            <g key={r.key}>
              <rect x={r.x - 30} y={30} width={180} height={238} rx={14} className="fig-box" />
              <text x={r.x - 14} y={54} className="fig-label">
                {r.short}
              </text>
              <text x={r.x + 68} y={162} className="fig-topic">
                /cmd_vel
              </text>
              <text x={r.x + 134} y={258} textAnchor="end" className="fig-small">
                domain {domain[r.key]}
              </text>
            </g>
          ))}

          {links.map((l) => {
            const from = centre(l.publisher.node.slice(-1))
            const to = centre(l.subscription.node.slice(-1))
            const own = from === to
            const d = own
              ? `M${from},${TELEOP_Y + 22} V${MOTORS_Y - 26}`
              : `M${from + (to > from ? 40 : -40)},${TELEOP_Y + 18} L${to + (to > from ? -40 : 40)},${MOTORS_Y - 22}`
            return (
              <g key={`${l.publisher.node}-${l.subscription.node}`}>
                <path d={d} className={own ? 'fig-line-s1' : 'fig-line-s2'} markerEnd={arrow(own ? 's1' : 's2')} />
                <circle r={5} className={own ? 'msg-dot' : 'msg-dot is-stray'}>
                  <animateMotion dur="1.4s" repeatCount="indefinite" path={d} />
                </circle>
              </g>
            )
          })}

          {ROBOTS.map((r) => (
            <g key={`nodes-${r.key}`}>
              <ellipse cx={centre(r.key)} cy={TELEOP_Y} rx={66} ry={21} className="fig-node" />
              <text x={centre(r.key)} y={TELEOP_Y + 4.5} textAnchor="middle" className="fig-mono">
                /teleop_{r.key}
              </text>
              <ellipse cx={centre(r.key)} cy={MOTORS_Y} rx={66} ry={21} className={obeys(r.key).length > 1 ? 'fig-node-warn' : 'fig-node'} />
              <text x={centre(r.key)} y={MOTORS_Y + 4.5} textAnchor="middle" className="fig-mono">
                /motors_{r.key}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="cards">
        {ROBOTS.map((r) => {
          const sources = obeys(r.key)
          return (
            <div className="card" key={r.key}>
              <div className="card-title">{r.label}</div>
              <div className="card-value">{sources.length === 1 ? 'One joystick' : `${sources.length} joysticks`}</div>
              <div className="card-note">
                /motors_{r.key} takes commands from {sources.map((s) => `/${s}`).join(' and ')}.
                {sources.length > 1 && ' A subscriber is not told which publisher sent a message, so both look the same to it.'}
              </div>
            </div>
          )
        })}
      </div>

      <Terminal
        simulated
        title={`A terminal on your robot (ROS_DOMAIN_ID=${domain.a})`}
        run={{ command: 'ros2 node list', output: nodeList(graph, domain.a).join('\n'), ended: 'exit' }}
      />
    </Playground>
  )
}
