import { arrow } from './arrows'
import { Figure } from './Figure'

/** How nodes found each other in ROS 1, and in ROS 2. */
export function MasterVsDds() {
  return (
    <Figure
      height={240}
      label="On the left, ROS 1: every node registers with one roscore master, which also holds the global parameter server; nodes then connect to each other directly over TCP. If the master stops, no new connections can be made. On the right, ROS 2: there is no master; nodes discover each other through DDS, each node holds its own parameters, and quality of service is chosen per connection."
      caption={
        <>
          The biggest change is underneath. ROS 1 had a <strong>master</strong> that every node registered with, a global
          parameter server inside it, and reliable TCP connections by default. ROS 2 has none of these: discovery is shared
          among the nodes (Lesson 14), parameters belong to nodes (Lesson 12), and reliability is a choice.
        </>
      }
    >
      <text x={20} y={22} className="fig-label">
        ROS 1
      </text>
      <rect x={120} y={36} width={140} height={54} rx={10} className="fig-box-accent" />
      <text x={190} y={58} textAnchor="middle" className="fig-mono-strong">
        roscore
      </text>
      <text x={190} y={76} textAnchor="middle" className="fig-small">
        master + parameters
      </text>
      {[
        [60, 170],
        [190, 190],
        [320, 170],
      ].map(([x, y]) => (
        <g key={x}>
          <line x1={x} y1={y - 20} x2={190} y2={92} className="fig-line-muted fig-dash" markerEnd={arrow('muted')} />
          <ellipse cx={x} cy={y} rx={44} ry={18} className="fig-node" />
          <text x={x} y={y + 4} textAnchor="middle" className="fig-small">
            node
          </text>
        </g>
      ))}
      <line x1={104} y1={174} x2={146} y2={184} className="fig-line-s1" />
      <line x1={234} y1={186} x2={276} y2={176} className="fig-line-s1" />
      <text x={190} y={226} textAnchor="middle" className="fig-small">
        register with the master, then TCP between nodes
      </text>

      <text x={420} y={22} className="fig-label">
        ROS 2
      </text>
      {[
        [480, 80, 'node + its parameters'],
        [640, 80, 'node + its parameters'],
        [560, 180, 'node + its parameters'],
      ].map(([x, y, t]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x as number} cy={y as number} rx={70} ry={22} className="fig-node" />
          <text x={x as number} y={(y as number) + 4} textAnchor="middle" className="fig-small">
            {t}
          </text>
        </g>
      ))}
      <line x1={550} y1={80} x2={570} y2={80} className="fig-line-s1" />
      <line x1={510} y1={100} x2={540} y2={160} className="fig-line-s1" />
      <line x1={610} y1={100} x2={580} y2={160} className="fig-line-s1" />
      <text x={560} y={226} textAnchor="middle" className="fig-small">
        discovery among the nodes (DDS), QoS per connection
      </text>
    </Figure>
  )
}
