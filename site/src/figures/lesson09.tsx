import { arrow } from './arrows'
import { Figure } from './Figure'

/** Gazebo, the bridge and the ROS side of the Lesson 9 simulation. */
export function SimStack() {
  const toRos = ['/clock', '/odom', '/tf', '/joint_states']
  return (
    <Figure
      height={330}
      label="On the left, Gazebo: a server that steps the physics and runs systems such as DiffDrive and JointStatePublisher, and a window that shows the world. In the middle, ros_gz_bridge's parameter_bridge carries /clock, /odom, /tf and /joint_states from Gazebo to ROS, and /cmd_vel from ROS to Gazebo. On the right, the ROS side: robot_state_publisher on simulated time, which publishes /robot_description; ros_gz_sim create, which reads that description once and asks Gazebo to add the robot to the world; and your nodes, teleop or RViz."
      caption={
        <>
          Gazebo and ROS are separate programs with separate messages and transports. The bridge is a ROS node that is
          also a Gazebo client, translating each topic it is told about. The robot&apos;s description goes the other way
          once, at the start: <code>create</code> reads it from ROS and hands it to Gazebo.
        </>
      }
    >
      <rect x={14} y={14} width={230} height={300} rx={12} className="fig-box" />
      <text x={30} y={40} className="fig-label">
        Gazebo
      </text>
      <rect x={30} y={54} width={198} height={160} rx={8} className="fig-box-accent" />
      <text x={44} y={76} className="fig-mono-strong">
        server: gz sim -s
      </text>
      {['physics, 1 ms steps', 'DiffDrive system', 'JointStatePublisher', 'the world: arena.sdf'].map((t, i) => (
        <text key={t} x={44} y={100 + i * 26} className="fig-small">
          {t}
        </text>
      ))}
      <rect x={30} y={226} width={198} height={70} rx={8} className="fig-box" />
      <text x={44} y={250} className="fig-mono-strong">
        window: gz sim -g
      </text>
      <text x={44} y={272} className="fig-small">
        draws the world; optional
      </text>
      <line x1={129} y1={214} x2={129} y2={224} className="fig-line" />

      <rect x={284} y={54} width={152} height={260} rx={10} className="fig-box" />
      <text x={360} y={78} textAnchor="middle" className="fig-mono-strong">
        parameter_bridge
      </text>
      <text x={360} y={96} textAnchor="middle" className="fig-small">
        ros_gz_bridge
      </text>
      {toRos.map((t, i) => (
        <g key={t}>
          <line x1={228} y1={124 + i * 30} x2={474} y2={124 + i * 30} className="fig-line-s1" markerEnd={arrow('s1')} />
          <rect x={306} y={112 + i * 30} width={108} height={22} rx={5} className="topic-box" />
          <text x={360} y={127 + i * 30} textAnchor="middle" className="fig-topic">
            {t}
          </text>
        </g>
      ))}
      <line x1={474} y1={250} x2={230} y2={250} className="fig-line-s2" markerEnd={arrow('s2')} />
      <rect x={306} y={238} width={108} height={22} rx={5} className="topic-box" />
      <text x={360} y={253} textAnchor="middle" className="fig-topic">
        /cmd_vel
      </text>

      <rect x={476} y={14} width={230} height={300} rx={12} className="fig-box" />
      <text x={492} y={40} className="fig-label">
        ROS 2
      </text>
      {[
        ['robot_state_publisher', 'use_sim_time: true'],
        ['ros_gz_sim create', 'spawns the robot, once'],
        ['teleop, RViz, your nodes', 'publish /cmd_vel, read /odom'],
      ].map(([name, what], i) => (
        <g key={name}>
          <rect x={492} y={60 + i * 80} width={198} height={56} rx={8} className={i === 2 ? 'fig-box-accent' : 'fig-box'} />
          <text x={506} y={84 + i * 80} className="fig-mono">
            {name}
          </text>
          <text x={506} y={104 + i * 80} className="fig-small">
            {what}
          </text>
        </g>
      ))}
      <path d="M591,116 V138" className="fig-line fig-dash" markerEnd={arrow('ink')} />
      <text x={600} y={132} className="fig-small">
        /robot_description
      </text>
      <path d="M492,168 C440,168 440,40 230,40" className="fig-line fig-dash" markerEnd={arrow('ink')} />
      <text x={300} y={34} className="fig-small">
        the robot, added to the world
      </text>
    </Figure>
  )
}
