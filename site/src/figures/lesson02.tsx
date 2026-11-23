import { arrow } from './arrows'
import { Figure } from './Figure'

/** A line-following robot as a graph: five nodes, three topics. */
export function RobotGraph() {
  const nodes: { name: string; x: number; y: number; job: string }[] = [
    { name: '/camera_driver', x: 104, y: 76, job: 'reads the camera' },
    { name: '/line_detector', x: 360, y: 76, job: 'finds the line in the image' },
    { name: '/steering', x: 616, y: 76, job: 'decides how to turn' },
    { name: '/recorder', x: 360, y: 196, job: 'saves images to disk' },
    { name: '/motor_driver', x: 616, y: 196, job: 'talks to the motors' },
  ]
  return (
    <Figure
      height={250}
      label="A line-following robot drawn as a graph. The camera driver node publishes the topic /image, which goes to two nodes: the line detector and the recorder. The line detector publishes /line_offset to the steering node, which publishes /cmd_vel to the motor driver."
      caption="Each ellipse is a node: one program with one job. Each arrow is a topic: a named stream of messages. The camera driver publishes /image once and both subscribers receive it; it does not need to know who is listening."
    >
      <line x1={184} y1={76} x2={278} y2={76} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={231} y={64} textAnchor="middle" className="fig-topic">
        /image
      </text>
      <line x1={440} y1={76} x2={534} y2={76} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={487} y={64} textAnchor="middle" className="fig-topic">
        /line_offset
      </text>
      <path d="M104,100 V196 H278" className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={192} y={184} textAnchor="middle" className="fig-topic">
        /image
      </text>
      <line x1={616} y1={100} x2={616} y2={170} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={604} y={150} textAnchor="end" className="fig-topic">
        /cmd_vel
      </text>

      {nodes.map((n) => (
        <g key={n.name}>
          <ellipse cx={n.x} cy={n.y} rx={80} ry={24} className="fig-node" />
          <text x={n.x} y={n.y + 4.5} textAnchor="middle" className="fig-mono">
            {n.name}
          </text>
          <text x={n.x} y={n.y + (n.y < 100 ? -32 : 42)} textAnchor="middle" className="fig-small">
            {n.job}
          </text>
        </g>
      ))}
    </Figure>
  )
}

/** A Twist message: two Vector3 fields, each with three numbers. */
export function MessageAnatomy() {
  const parts: { field: string; unit: string; x: number; rows: { name: string; meaning: string; used?: boolean }[] }[] = [
    {
      field: 'linear',
      unit: 'metres per second',
      x: 60,
      rows: [
        { name: 'x', meaning: 'forward', used: true },
        { name: 'y', meaning: 'to the left' },
        { name: 'z', meaning: 'up' },
      ],
    },
    {
      field: 'angular',
      unit: 'radians per second',
      x: 372,
      rows: [
        { name: 'x', meaning: 'roll' },
        { name: 'y', meaning: 'pitch' },
        { name: 'z', meaning: 'yaw: turning on the spot', used: true },
      ],
    },
  ]
  return (
    <Figure
      height={236}
      label="The message type geometry_msgs/msg/Twist contains two fields, linear and angular. Each is a Vector3 with three float64 numbers, x, y and z. A wheeled robot uses two of the six: linear x for driving forward and angular z for turning."
      caption={
        <>
          A message type is a named bundle of fields, and a field can itself be another message type. A wheeled robot
          on flat ground uses two of these six numbers: <code>linear.x</code> to drive and <code>angular.z</code> to
          turn. The axis directions and units are a ROS-wide convention.
        </>
      }
    >
      <rect x={40} y={16} width={640} height={204} rx={12} className="fig-box" />
      <text x={60} y={44} className="fig-mono-strong">
        geometry_msgs/msg/Twist
      </text>
      <text x={660} y={44} textAnchor="end" className="fig-label">
        one message
      </text>
      {parts.map((p) => (
        <g key={p.field}>
          <rect x={p.x} y={58} width={288} height={146} rx={10} className="fig-node" />
          <text x={p.x + 16} y={84} className="fig-mono-strong">
            Vector3 {p.field}
          </text>
          <text x={p.x + 272} y={84} textAnchor="end" className="fig-small">
            {p.unit}
          </text>
          {p.rows.map((r, i) => {
            const y = 100 + i * 32
            return (
              <g key={r.name}>
                <rect x={p.x + 12} y={y} width={264} height={26} rx={6} className={r.used ? 'fig-chip-accent' : 'fig-chip'} />
                <text x={p.x + 24} y={y + 17.5} className="fig-mono">
                  float64 {r.name}
                </text>
                <text x={p.x + 264} y={y + 17.5} textAnchor="end" className="fig-small">
                  {r.meaning}
                </text>
              </g>
            )
          })}
        </g>
      ))}
    </Figure>
  )
}

/** Discovery in three steps: announce, answer, connect. */
export function Discovery() {
  const panels: { title: string; lines: [string, string] }[] = [
    { title: '1  A node starts', lines: ['It announces itself to every', 'node in its domain.'] },
    { title: '2  The others answer', lines: ['Each says what it publishes', 'and subscribes to.'] },
    { title: '3  Matching ends connect', lines: ['Messages then travel directly.', 'Nothing sits in the middle.'] },
  ]
  return (
    <Figure
      height={262}
      label="Discovery in three steps. First a new node, the lidar driver, announces itself to the other nodes. Second, the other nodes answer with what they publish and subscribe to. Third, the lidar driver and the mapper, which share the topic /scan, connect directly; the logger, which has no topic in common, stays unconnected."
      caption="No node is told about the others in advance and there is no central directory. That is why two nodes can be started in either order, on the same computer or on two, and still find each other."
    >
      {panels.map((p, i) => {
        const x0 = 12 + i * 236
        const top = { x: x0 + 112, y: 132 }
        const left = { x: x0 + 58, y: 222 }
        const right = { x: x0 + 166, y: 222 }
        return (
          <g key={p.title}>
            <rect x={x0} y={8} width={224} height={248} rx={12} className="fig-box" />
            <text x={x0 + 16} y={34} className="fig-strong">
              {p.title}
            </text>
            <text x={x0 + 16} y={56} className="fig-small">
              {p.lines[0]}
            </text>
            <text x={x0 + 16} y={73} className="fig-small">
              {p.lines[1]}
            </text>

            {i === 0 && (
              <>
                <line x1={top.x - 20} y1={top.y + 20} x2={left.x + 8} y2={left.y - 24} className="fig-line fig-dash" markerEnd={arrow('ink')} />
                <line x1={top.x + 20} y1={top.y + 20} x2={right.x - 8} y2={right.y - 24} className="fig-line fig-dash" markerEnd={arrow('ink')} />
              </>
            )}
            {i === 1 && (
              <>
                <line x1={left.x + 8} y1={left.y - 24} x2={top.x - 20} y2={top.y + 20} className="fig-line fig-dash" markerEnd={arrow('ink')} />
                <line x1={right.x - 8} y1={right.y - 24} x2={top.x + 20} y2={top.y + 20} className="fig-line fig-dash" markerEnd={arrow('ink')} />
              </>
            )}
            {i === 2 && (
              <>
                <line x1={top.x - 20} y1={top.y + 20} x2={left.x + 8} y2={left.y - 24} className="fig-line-s1" markerEnd={arrow('s1')} />
                <text x={x0 + 62} y={176} textAnchor="end" className="fig-topic">
                  /scan
                </text>
              </>
            )}

            <ellipse cx={top.x} cy={top.y} rx={46} ry={19} className={i === 0 ? 'fig-node-accent' : 'fig-node'} />
            <text x={top.x} y={top.y + 4.5} textAnchor="middle" className="fig-mono">
              /lidar
            </text>
            <ellipse cx={left.x} cy={left.y} rx={46} ry={19} className="fig-node" />
            <text x={left.x} y={left.y + 4.5} textAnchor="middle" className="fig-mono">
              /mapper
            </text>
            <g className={i === 2 ? 'fig-faded' : undefined}>
              <ellipse cx={right.x} cy={right.y} rx={46} ry={19} className="fig-node" />
              <text x={right.x} y={right.y + 4.5} textAnchor="middle" className="fig-mono">
                /logger
              </text>
            </g>
          </g>
        )
      })}
    </Figure>
  )
}

/** The answer to the Lesson 2 lab: the graph of labs/lesson02/mystery_graph.py. */
export function MysteryGraph() {
  const nodes: { name: string; x: number; y: number }[] = [
    { name: '/wheel_encoder', x: 160, y: 50 },
    { name: '/lidar', x: 470, y: 50 },
    { name: '/odometry', x: 160, y: 150 },
    { name: '/obstacle_detector', x: 470, y: 150 },
    { name: '/planner', x: 160, y: 250 },
    { name: '/safety_stop', x: 470, y: 250 },
    { name: '/motor_driver', x: 315, y: 350 },
  ]
  const edges: { d: string; label: string; lx: number; ly: number; anchor?: 'start' | 'middle' | 'end' }[] = [
    { d: 'M160,71 V127', label: '/joint_states', lx: 168, ly: 104 },
    { d: 'M470,71 V127', label: '/scan', lx: 478, ly: 104 },
    { d: 'M160,171 V227', label: '/odom', lx: 168, ly: 204 },
    { d: 'M470,171 V227', label: '/obstacle', lx: 478, ly: 204 },
    { d: 'M418,166 L222,235', label: '/obstacle', lx: 296, ly: 228, anchor: 'start' },
    { d: 'M190,271 L268,329', label: '/cmd_vel', lx: 220, ly: 314, anchor: 'end' },
    { d: 'M440,271 L362,329', label: '/cmd_vel', lx: 410, ly: 314, anchor: 'start' },
    { d: 'M241,354 C120,354 70,320 84,262', label: '/motor_state', lx: 160, ly: 380, anchor: 'middle' },
    { d: 'M600,350 H392', label: '/emergency_stop', lx: 496, ly: 340, anchor: 'middle' },
    { d: 'M315,371 V420', label: '/battery', lx: 323, ly: 400, anchor: 'start' },
  ]
  return (
    <Figure
      height={462}
      label="The lab robot's graph. The wheel encoder publishes /joint_states to the odometry node, which publishes /odom to the planner. The lidar publishes /scan to the obstacle detector, which publishes /obstacle to both the planner and the safety stop. The planner and the safety stop both publish /cmd_vel to the motor driver. The motor driver publishes /motor_state back to the planner, and /battery, which nothing subscribes to. It subscribes to /emergency_stop, which nothing publishes."
      caption="Sensors at the top, motors at the bottom. Two nodes command the motors on the same topic, and the motor driver is not told which one sent a given command. /battery is published for anyone who wants it, and /emergency_stop is a door left open for an operator: in the lab, that was you."
    >
      {edges.map((e) => (
        <g key={e.d}>
          <path d={e.d} className="fig-line-s1" markerEnd={arrow('s1')} />
          <text x={e.lx} y={e.ly} textAnchor={e.anchor ?? 'start'} className="fig-topic">
            {e.label}
          </text>
        </g>
      ))}
      <rect x={600} y={334} width={112} height={32} rx={8} className="fig-box fig-dash" />
      <text x={656} y={354} textAnchor="middle" className="fig-small">
        no publisher
      </text>
      <rect x={259} y={422} width={112} height={32} rx={8} className="fig-box fig-dash" />
      <text x={315} y={442} textAnchor="middle" className="fig-small">
        no subscriber
      </text>
      {nodes.map((n) => (
        <g key={n.name}>
          <ellipse cx={n.x} cy={n.y} rx={78} ry={21} className="fig-node" />
          <text x={n.x} y={n.y + 4.5} textAnchor="middle" className="fig-mono">
            {n.name}
          </text>
        </g>
      ))}
    </Figure>
  )
}
