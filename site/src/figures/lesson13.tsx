import { arrow } from './arrows'
import { Figure } from './Figure'

/** The usual layers of a mobile robot's software, with this course's nodes in them. */
export function StackLayers() {
  const layers = [
    { name: 'Interfaces', what: 'people and other programs', ours: 'teleop_twist_keyboard, RViz, ros2 action send_goal' },
    { name: 'Planning', what: 'where to go, and in what order', ours: 'go_to (Lesson 17)' },
    { name: 'Control', what: 'turning a plan into commands', ours: 'go_to’s controller: /cmd_vel_in' },
    { name: 'Safety', what: 'limits that hold whatever asks', ours: 'speed_limiter, cmd_watchdog' },
    { name: 'Estimation', what: 'where the robot is', ours: 'odometry, tf2 (map → odom → base_link)' },
    { name: 'Drivers', what: 'talking to the hardware', ours: 'Gazebo and its bridge, in place of motors and sensors' },
  ]
  return (
    <Figure
      height={360}
      label="Six layers from top to bottom: interfaces, planning, control, safety, estimation and drivers, each with the nodes from this course that belong to it. Commands flow down from interfaces to drivers; measurements flow up from drivers through estimation to planning and control."
      caption={
        <>
          Most mobile robots divide their software this way, whatever the names. Commands flow down; measurements flow up.
          Each layer only needs to know the interfaces of the layers next to it, which is what lets you swap Gazebo for real
          motors, or a keyboard for a planner, without touching the rest.
        </>
      }
    >
      {layers.map((l, i) => {
        const y = 12 + i * 56
        return (
          <g key={l.name}>
            <rect x={60} y={y} width={600} height={46} rx={8} className={l.name === 'Safety' ? 'fig-box-accent' : 'fig-box'} />
            <text x={76} y={y + 20} className="fig-mono-strong">
              {l.name}
            </text>
            <text x={76} y={y + 37} className="fig-small">
              {l.what}
            </text>
            <text x={300} y={y + 29} className="fig-mono">
              {l.ours}
            </text>
          </g>
        )
      })}
      <line x1={30} y1={20} x2={30} y2={330} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={22} y={180} textAnchor="middle" className="fig-small" transform="rotate(-90 22 180)">
        commands
      </text>
      <line x1={690} y1={330} x2={690} y2={20} className="fig-line-s2" markerEnd={arrow('s2')} />
      <text x={702} y={180} textAnchor="middle" className="fig-small" transform="rotate(90 702 180)">
        measurements
      </text>
    </Figure>
  )
}
