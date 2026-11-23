import { RELEASES, release, when } from '../ros/releases'
import { lesson01 } from '../transcripts'
import { arrow } from './arrows'
import { Figure } from './Figure'

/** What ROS adds on top of the operating system, layer by layer. */
export function RosToolbox() {
  const layers: { name: string; parts: string; accent?: boolean }[] = [
    { name: 'Your nodes', parts: 'a camera driver, a line detector, a planner: one program per job', accent: true },
    { name: 'Client libraries', parts: 'rclcpp for C++, rclpy for Python: how your code talks to ROS' },
    { name: 'Communication', parts: 'topics, services, actions, parameters, within a computer or across a network' },
    { name: 'Tools', parts: 'the ros2 command, launch files, bags, RViz, rqt' },
    { name: 'Shared packages', parts: 'drivers, navigation, simulation and much more, ready to install' },
    { name: 'Operating system', parts: 'Ubuntu 24.04 here. ROS runs on it; it is not one itself' },
  ]
  return (
    <Figure
      height={300}
      label="Six layers, top to bottom: your nodes; client libraries rclcpp and rclpy; communication by topics, services, actions and parameters; tools such as the ros2 command, launch files, bags, RViz and rqt; shared packages such as drivers and navigation; and underneath, the operating system, Ubuntu 24.04."
      caption="ROS is the middle four layers. You write the top one, and you choose and install shared packages as you need them. Despite the name, it is not an operating system: it is a set of libraries and tools that run on one."
    >
      {layers.map((l, i) => {
        const y = 10 + i * 48
        const os = i === layers.length - 1
        return (
          <g key={l.name}>
            <rect x={20} y={y} width={650} height={40} rx={8} className={l.accent ? 'fig-box-accent' : os ? 'fig-chip' : 'fig-box'} />
            <text x={36} y={y + 25} className="fig-strong">
              {l.name}
            </text>
            <text x={200} y={y + 25} className="fig-small">
              {l.parts}
            </text>
          </g>
        )
      })}
      <path d="M680,60 H688 V240 H680" className="fig-line-s1" />
      <text x={704} y={150} textAnchor="middle" className="fig-label" transform="rotate(-90 704 150)">
        ROS
      </text>
    </Figure>
  )
}

/** ROS 1 and ROS 2 releases, with the long-term ones as bars showing their support. */
export function ReleaseTimeline() {
  const x0 = 70
  const x1 = 690
  const from = 2010
  const to = 2032
  const x = (t: number) => x0 + ((t - from) / (to - from)) * (x1 - x0)
  const years = Array.from({ length: (to - from) / 2 + 1 }, (_, i) => from + i * 2)
  // One lane per release that would otherwise overlap another.
  const lanes: Record<string, number> = { Box: 40, Noetic: 40, Ardent: 108, Foxy: 140, Humble: 108, Jazzy: 140, Kilted: 172, Lyrical: 204 }
  const rows: { generation: 1 | 2; y: number; label: string }[] = [
    { generation: 1, y: 40, label: 'ROS 1' },
    { generation: 2, y: 156, label: 'ROS 2' },
  ]
  const jazzy = release('Jazzy')
  const short = (name: string) => (name.startsWith('Box') ? 'Box Turtle' : name.split(' ')[0])
  return (
    <Figure
      height={262}
      label="A timeline from 2010 to 2032. ROS 1 began with Box Turtle in March 2010 and ended with Noetic, released in May 2020 and supported until May 2025. ROS 2's first release, Ardent, came in December 2017. Foxy, from 2020, was supported for three years. Since Humble in May 2022, a long-term release has come every second May with five years of support: Humble until 2027, Jazzy until May 2029, and Lyrical, released May 2026, until 2031. Kilted, a short-term release, is supported until December 2026. This course uses Jazzy."
      caption="Each ROS 2 release is a fixed set of packages. Since Humble in 2022, a long-term release has come every second May with five years of support, and the releases in between get about a year and a half. ROS 1 is finished: its last release, Noetic, reached the end of support in May 2025. This course uses Jazzy, as ETH's 2026 course does. Lyrical, two years newer, differs in details, not in anything these lessons teach."
    >
      {years.map((y) => (
        <g key={y}>
          <line x1={x(y)} y1={14} x2={x(y)} y2={226} className="fig-line-muted" />
          <text x={x(y)} y={246} textAnchor="middle" className="fig-small">
            {y}
          </text>
        </g>
      ))}
      <line x1={x0 - 4} y1={74} x2={x1} y2={74} className="fig-line-muted" />
      {rows.map((row) => (
        <g key={row.label}>
          <text x={x0 - 10} y={row.y + 5} textAnchor="end" className="fig-strong">
            {row.label}
          </text>
          {RELEASES.filter((r) => r.generation === row.generation).map((r) => {
            const a = x(when(r.released))
            const b = x(when(r.eol))
            const lane = lanes[r.name.split(' ')[0]]
            const isJazzy = r === jazzy
            return (
              <g key={r.name}>
                <rect x={a} y={lane - 6} width={Math.max(b - a, 6)} height={12} rx={4} className={isJazzy ? 'fig-box-accent' : r.lts ? 'fig-box' : 'fig-chip'} />
                <text x={a} y={lane - 10} className={isJazzy ? 'fig-strong' : 'fig-small'}>
                  {short(r.name)}
                  {isJazzy ? ' (this course)' : ''}
                </text>
              </g>
            )
          })}
        </g>
      ))}
    </Figure>
  )
}

/** Where the course's ROS runs: in a container on your computer, reached from the lesson page. */
export function ContainerSetup() {
  return (
    <Figure
      height={250}
      label="Your computer runs Docker, and Docker runs the course container: Ubuntu 24.04 with ROS 2 Jazzy. The lesson page in your browser shows terminals that are shells inside that container, reached at localhost port 7681. The labs folder of the course is shared between your computer and the container, where it appears as /labs."
      caption="The container is a small, self-contained Linux system with ROS already installed, so everyone gets the same versions and nothing ROS-related is installed on your computer. Terminals in the page are shells inside it. Files in the course's labs folder are shared, so you can edit them with any editor."
    >
      <rect x={14} y={14} width={692} height={222} rx={14} className="fig-box" />
      <text x={30} y={38} className="fig-label">
        Your computer
      </text>

      <rect x={36} y={60} width={220} height={150} rx={10} className="fig-node" />
      <text x={52} y={84} className="fig-strong">
        Browser
      </text>
      <rect x={52} y={98} width={188} height={52} rx={6} className="fig-chip" />
      <text x={64} y={120} className="fig-small">
        lesson page
      </text>
      <rect x={64} y={128} width={164} height={16} rx={3} className="fig-chip-accent" />
      <text x={70} y={140} className="fig-mono">
        $ ros2 node list
      </text>
      <text x={52} y={178} className="fig-small">
        terminals in the page
      </text>

      <rect x={360} y={60} width={320} height={150} rx={10} className="fig-box-accent" />
      <text x={376} y={84} className="fig-strong">
        Course container (run by Docker)
      </text>
      <text x={376} y={110} className="fig-small">
        Ubuntu 24.04
      </text>
      <text x={376} y={130} className="fig-small">
        ROS 2 Jazzy, already set up in every shell
      </text>
      <text x={376} y={150} className="fig-small">
        terminal server on localhost:7681
      </text>
      <text x={376} y={186} className="fig-mono">
        /labs
      </text>

      <line x1={256} y1={124} x2={358} y2={124} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={307} y={116} textAnchor="middle" className="fig-small">
        localhost:7681
      </text>
      <text x={160} y={228} textAnchor="middle" className="fig-mono">
        labs/ folder
      </text>
      <path d="M210,224 H420 V196" className="fig-line fig-dash" markerEnd={arrow('ink')} />
      <text x={300} y={218} textAnchor="middle" className="fig-small">
        shared
      </text>
    </Figure>
  )
}

/** What `source /opt/ros/jazzy/setup.bash` changes, with the values recorded in the container. */
export function SourcingFigure() {
  const { runs } = lesson01
  const vars = runs['fresh-after'].output.split('\n')
  const firstPath = runs['fresh-path'].output.split('\n')[0]
  const ament = runs['fresh-ament'].output
  const after = [...vars, `AMENT_PREFIX_PATH=${ament}`, `PATH=${firstPath}:…`]
  return (
    <Figure
      height={260}
      label={`Before sourcing, the shell has no ROS variables and the ros2 command is not found. Sourcing the setup file adds ${after.length} settings, including ROS_DISTRO=jazzy and the folder ${firstPath} at the front of PATH, after which ros2 is found.`}
      caption={
        <>
          A shell finds programs by looking through the folders listed in <code>PATH</code>. Sourcing runs the setup file{' '}
          <em>inside</em> the current shell, so the settings it makes stay there: ROS's folder goes on the front of the
          list, and variables tell ROS tools which release and which packages to use. They last until that terminal
          closes, which is why every new terminal needs it.
        </>
      }
    >
      <rect x={20} y={14} width={250} height={228} rx={10} className="fig-box" />
      <text x={36} y={40} className="fig-label">
        Before
      </text>
      <text x={36} y={70} className="fig-small">
        no ROS variables
      </text>
      <text x={36} y={92} className="fig-small">
        PATH without ROS
      </text>
      <rect x={32} y={180} width={226} height={44} rx={6} className="fig-chip" />
      <text x={44} y={199} className="fig-mono">
        $ ros2
      </text>
      <text x={44} y={216} className="fig-small">
        command not found
      </text>

      <line x1={276} y1={128} x2={330} y2={128} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={303} y={110} textAnchor="middle" className="fig-small">
        source
      </text>

      <rect x={336} y={14} width={364} height={228} rx={10} className="fig-box-accent" />
      <text x={352} y={40} className="fig-label">
        After
      </text>
      {after.map((v, i) => (
        <text key={v} x={352} y={66 + i * 18} className="fig-mono">
          {v}
        </text>
      ))}
      <rect x={348} y={180} width={340} height={44} rx={6} className="fig-chip" />
      <text x={360} y={199} className="fig-mono">
        $ ros2
      </text>
      <text x={360} y={216} className="fig-small">
        found: {runs['fresh-which'].output}
      </text>
    </Figure>
  )
}
