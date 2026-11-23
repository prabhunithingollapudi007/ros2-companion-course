import { arrow } from './arrows'
import { Figure } from './Figure'

/** Starting a system by hand against starting it with one launch file. */
export function WhyLaunch() {
  const nodes = ['battery', 'monitor', 'dashboard', 'battery', 'monitor']
  return (
    <Figure
      height={250}
      label="On the left, five terminals each run one ros2 run command, each typed with its own namespace and remappings, and each has to be stopped separately. On the right, one ros2 launch command reads a launch file, starts the same five processes, labels their output, and stops them all with one Ctrl+C."
      caption="A launch file is a Python program that describes which nodes to start and how to name and wire them. ros2 launch runs it, starts every process, prefixes each line of output with the process it came from, and on Ctrl+C stops them all. The description lives in a file under version control instead of in someone's terminal history."
    >
      <text x={16} y={24} className="fig-label">
        By hand
      </text>
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={16} y={36 + i * 40} width={300} height={32} rx={6} className="fig-chip" />
          <text x={28} y={57 + i * 40} className="fig-mono">
            $ ros2 run fleet_demo {n} …
          </text>
        </g>
      ))}

      <text x={340} y={24} className="fig-label">
        With a launch file
      </text>
      <rect x={340} y={36} width={366} height={32} rx={6} className="fig-box-accent" />
      <text x={352} y={57} className="fig-mono">
        $ ros2 launch fleet_bringup fleet.launch.py
      </text>
      <line x1={522} y1={68} x2={522} y2={92} className="fig-line-s1" markerEnd={arrow('s1')} />
      <rect x={340} y={94} width={366} height={136} rx={8} className="fig-box" />
      {nodes.map((n, i) => (
        <text key={i} x={356} y={118 + i * 22} className="fig-mono">
          [{n}-{i + 1}] …
        </text>
      ))}
      <text x={684} y={118} textAnchor="end" className="fig-small">
        one terminal,
      </text>
      <text x={684} y={136} textAnchor="end" className="fig-small">
        labelled output,
      </text>
      <text x={684} y={154} textAnchor="end" className="fig-small">
        one Ctrl+C
      </text>
    </Figure>
  )
}

/** Where ros2 launch looks for a launch file, and how it gets there. */
export function WhereLaunchLooks() {
  return (
    <Figure
      height={200}
      label="ros2 launch launch_demo talk_listen.launch.py looks in the share folder of the package launch_demo, install/launch_demo/share/launch_demo, for the file. It gets there only because the package's CMakeLists.txt installs the launch folder there when it is built. Editing the file in src has no effect until the next build."
      caption={
        <>
          <code>ros2 launch</code> never reads your <code>src</code> folder. It finds the package, then looks for the file
          in that package's <em>installed</em> share folder. A launch file that is not installed gives the error recorded
          below, and an edit to one in <code>src</code> takes effect only after the next <code>colcon build</code>.
        </>
      }
    >
      <rect x={20} y={20} width={210} height={70} rx={10} className="fig-box" />
      <text x={36} y={46} className="fig-mono-strong">
        src/launch_demo/
      </text>
      <text x={36} y={70} className="fig-mono">
        launch/talk_listen.launch.py
      </text>

      <line x1={230} y1={55} x2={300} y2={55} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={265} y={46} textAnchor="middle" className="fig-small">
        colcon build
      </text>
      <text x={265} y={74} textAnchor="middle" className="fig-mono">
        install(...)
      </text>

      <rect x={302} y={20} width={398} height={70} rx={10} className="fig-box-accent" />
      <text x={318} y={46} className="fig-mono-strong">
        install/launch_demo/share/launch_demo/
      </text>
      <text x={318} y={70} className="fig-mono">
        launch/talk_listen.launch.py
      </text>

      <rect x={302} y={120} width={398} height={44} rx={8} className="fig-chip" />
      <text x={318} y={147} className="fig-mono">
        $ ros2 launch launch_demo talk_listen.launch.py
      </text>
      <line x1={500} y1={118} x2={500} y2={92} className="fig-line" markerEnd={arrow('ink')} />
    </Figure>
  )
}
