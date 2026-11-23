import { arrow } from './arrows'
import { Figure } from './Figure'

/** The capstone's whole graph: everything the course built, with go_to on top. */
export function CapstoneGraph() {
  const chain: [string, number][] = [
    ['go_to', 70],
    ['speed_limiter', 290],
    ['cmd_watchdog', 500],
    ['Gazebo + bridge', 700],
  ]
  const rx = (name: string) => name.length * 4 + 18
  const topics = ['/cmd_vel_in', '/cmd_vel_limited', '/cmd_vel']
  return (
    <Figure
      width={790}
      height={300}
      label="The capstone graph. Your client sends a goal on the /go_to action. go_to publishes velocity commands on /cmd_vel_in to the speed limiter (Lessons 10 and 12), which publishes /cmd_vel_limited to the watchdog (Lesson 13), which publishes /cmd_vel to Gazebo (Lesson 9). Gazebo publishes /odom back to go_to, and joint states to robot_state_publisher (Lesson 7), which publishes the frames (Lesson 8). A bag records /odom and /cmd_vel (Lesson 6). All settings come from YAML files (Lesson 12)."
      caption={
        <>
          Every box is a lesson: the robot model (7), its frames (8), the simulation (9), the limiter&apos;s service and
          parameters (10, 12), the watchdog in the stack (13), the action (11), the bag (6). go_to is the only new node, and
          it talks to the rest only through the interfaces they already had.
        </>
      }
    >
      <rect x={20} y={20} width={130} height={34} rx={8} className="fig-box" />
      <text x={85} y={42} textAnchor="middle" className="fig-mono">
        your client
      </text>
      <line x1={85} y1={54} x2={85} y2={92} className="fig-line-s2" markerEnd={arrow('s2')} />
      <text x={94} y={68} className="fig-small">
        /go_to (action)
      </text>
      {chain.map(([name, x], i) => (
        <g key={name}>
          <ellipse cx={x} cy={115} rx={rx(name)} ry={21} className={name === 'go_to' ? 'fig-node-accent' : 'fig-node'} />
          <text x={x} y={119.5} textAnchor="middle" className="fig-mono">
            {name}
          </text>
          {i < chain.length - 1 && (
            <>
              <line x1={x + rx(name)} y1={115} x2={chain[i + 1][1] - rx(chain[i + 1][0]) - 2} y2={115} className="fig-line-s1" markerEnd={arrow('s1')} />
              <text x={(x + rx(name) + chain[i + 1][1] - rx(chain[i + 1][0])) / 2} y={84} textAnchor="middle" className="fig-small">
                {topics[i]}
              </text>
            </>
          )}
        </g>
      ))}
      <path d="M700,136 C700,190 70,190 70,140" className="fig-line-s1 fig-dash" markerEnd={arrow('s1')} fill="none" />
      <text x={385} y={186} textAnchor="middle" className="fig-small">
        /odom
      </text>
      <ellipse cx={680} cy={250} rx={95} ry={21} className="fig-node" />
      <text x={680} y={254.5} textAnchor="middle" className="fig-mono">
        robot_state_publisher
      </text>
      <line x1={700} y1={136} x2={690} y2={226} className="fig-line" markerEnd={arrow('ink')} />
      <text x={706} y={208} className="fig-small">
        /joint_states
      </text>
      <rect x={240} y={232} width={190} height={36} rx={8} className="fig-box" />
      <text x={335} y={255} textAnchor="middle" className="fig-mono">
        ros2 bag record
      </text>
      <text x={335} y={286} textAnchor="middle" className="fig-small">
        /odom, /cmd_vel: the run, to check later
      </text>
    </Figure>
  )
}
