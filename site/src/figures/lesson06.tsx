import { arrow } from './arrows'
import { Figure } from './Figure'

/** Recording a topic into a bag, and playing it back to nodes that cannot tell the difference. */
export function BagRoundTrip() {
  return (
    <Figure
      height={230}
      label="On the left, a talker publishes /chatter and ros2 bag record subscribes to it, writing every message and its time into a bag folder holding metadata.yaml and an .mcap file. On the right, later, ros2 bag play reads the bag and publishes the same messages on /chatter with the same spacing, and a listener receives them as if the talker were there."
      caption="ros2 bag record is just another subscriber; it writes each message and when it arrived into a folder. ros2 bag play is just another publisher. A node listening to the replay cannot tell it from the original, which is what makes bags useful: record once on the robot, then develop and test at your desk, as often as you like, on exactly the same data."
    >
      <text x={20} y={22} className="fig-label">
        On the robot
      </text>
      <ellipse cx={90} cy={70} rx={62} ry={20} className="fig-node" />
      <text x={90} y={74.5} textAnchor="middle" className="fig-mono">
        /talker
      </text>
      <line x1={152} y1={70} x2={196} y2={70} className="fig-line-s1" markerEnd={arrow('s1')} />
      <rect x={198} y={52} width={86} height={36} rx={7} className="topic-box" />
      <text x={241} y={74.5} textAnchor="middle" className="fig-topic">
        /chatter
      </text>
      <line x1={241} y1={88} x2={241} y2={122} className="fig-line-s1" markerEnd={arrow('s1')} />
      <rect x={160} y={124} width={162} height={34} rx={7} className="fig-box-accent" />
      <text x={241} y={146} textAnchor="middle" className="fig-mono">
        ros2 bag record
      </text>

      <rect x={300} y={176} width={120} height={44} rx={8} className="fig-box" />
      <text x={360} y={194} textAnchor="middle" className="fig-mono">
        talk/
      </text>
      <text x={360} y={210} textAnchor="middle" className="fig-small">
        metadata.yaml, .mcap
      </text>
      <path d="M241,158 C241,190 270,198 298,198" className="fig-line" markerEnd={arrow('ink')} />
      <path d="M422,198 C450,198 479,190 479,158" className="fig-line" markerEnd={arrow('ink')} />

      <text x={420} y={22} className="fig-label">
        Later, at your desk
      </text>
      <rect x={398} y={124} width={162} height={34} rx={7} className="fig-box-accent" />
      <text x={479} y={146} textAnchor="middle" className="fig-mono">
        ros2 bag play
      </text>
      <line x1={479} y1={124} x2={479} y2={90} className="fig-line-s1" markerEnd={arrow('s1')} />
      <rect x={436} y={52} width={86} height={36} rx={7} className="topic-box" />
      <text x={479} y={74.5} textAnchor="middle" className="fig-topic">
        /chatter
      </text>
      <line x1={522} y1={70} x2={566} y2={70} className="fig-line-s1" markerEnd={arrow('s1')} />
      <ellipse cx={630} cy={70} rx={62} ry={20} className="fig-node-accent" />
      <text x={630} y={74.5} textAnchor="middle" className="fig-mono">
        /listener
      </text>
    </Figure>
  )
}

/** The three times that matter for a sensor reading. */
export function ThreeTimes() {
  const marks: { x: number; label: string; sub: string; accent?: boolean }[] = [
    { x: 120, label: 'measured', sub: 'header.stamp', accent: true },
    { x: 330, label: 'published', sub: 'after processing' },
    { x: 560, label: 'received', sub: 'after transport' },
  ]
  return (
    <Figure
      height={190}
      label="A timeline of one sensor reading. First it is measured; the message's header.stamp should record this moment. Then the driver publishes it, after some processing. Then a subscriber receives it, after transport. Only the stamp says when the reading is from."
      caption={
        <>
          A message can be published milliseconds or seconds after the moment it describes, and arrive later still. So
          messages that describe the world carry a <code>std_msgs/Header</code>: a <code>stamp</code>, when the data was
          measured, and a <code>frame_id</code>, where (Lesson 8). Anything that combines two sensors should line their
          readings up by stamp, never by when they happened to arrive.
        </>
      }
    >
      <line x1={40} y1={90} x2={690} y2={90} className="fig-line" markerEnd={arrow('ink')} />
      <text x={690} y={116} textAnchor="end" className="fig-small">
        time
      </text>
      {marks.map((m) => (
        <g key={m.label}>
          <circle cx={m.x} cy={90} r={8} className={m.accent ? 'fig-dot-s1' : 'fig-dot'} />
          <text x={m.x} y={60} textAnchor="middle" className="fig-strong">
            {m.label}
          </text>
          <text x={m.x} y={128} textAnchor="middle" className={m.accent ? 'fig-mono-strong' : 'fig-small'}>
            {m.sub}
          </text>
        </g>
      ))}
      <path d="M128,150 H322" className="fig-line-muted" markerEnd={arrow('muted')} />
      <text x={225} y={168} textAnchor="middle" className="fig-small">
        processing
      </text>
      <path d="M338,150 H552" className="fig-line-muted" markerEnd={arrow('muted')} />
      <text x={445} y={168} textAnchor="middle" className="fig-small">
        transport, queues
      </text>
    </Figure>
  )
}

/** Where a node's clock comes from, with and without use_sim_time. */
export function WhereTimeComes() {
  return (
    <Figure
      height={220}
      label="Without use_sim_time, a node's clock is the computer's clock. With use_sim_time set to true, it ignores the computer's clock and follows the /clock topic, which ros2 bag play --clock publishes with the time from the bag. Until something publishes /clock, such a node's clock reads zero."
      caption={
        <>
          A replayed bag carries the time it was recorded. With <code>use_sim_time</code> a node takes its time from{' '}
          <code>/clock</code> instead of from the computer, so its timers, its <code>now()</code> and anything that compares
          stamps with now all agree with the data. The same switch is how nodes follow a simulator's clock in Lesson 9.
        </>
      }
    >
      <rect x={20} y={20} width={300} height={78} rx={10} className="fig-box" />
      <text x={36} y={46} className="fig-strong">
        use_sim_time: false (the default)
      </text>
      <text x={36} y={70} className="fig-small">
        the computer&apos;s clock: today&apos;s date
      </text>

      <rect x={20} y={122} width={300} height={78} rx={10} className="fig-box-accent" />
      <text x={36} y={148} className="fig-strong">
        use_sim_time: true
      </text>
      <text x={36} y={172} className="fig-small">
        whatever /clock says; zero until it says anything
      </text>

      <rect x={420} y={122} width={280} height={44} rx={8} className="fig-box" />
      <text x={436} y={149} className="fig-mono">
        ros2 bag play ... --clock
      </text>
      <rect x={454} y={62} width={110} height={34} rx={7} className="topic-box" />
      <text x={509} y={84} textAnchor="middle" className="fig-topic">
        /clock
      </text>
      <line x1={509} y1={122} x2={509} y2={98} className="fig-line-s1" markerEnd={arrow('s1')} />
      <path d="M454,80 C380,80 380,160 322,160" className="fig-line-s1" markerEnd={arrow('s1')} />
    </Figure>
  )
}
