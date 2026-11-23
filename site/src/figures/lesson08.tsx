import { arrow } from './arrows'
import { Figure } from './Figure'

/** The frames of the Lesson 8 demo, and who publishes each link between them. */
export function FrameTree() {
  const edges: { from: [number, number]; to: [number, number]; who: string; topic: string }[] = [
    { from: [110, 54], to: [110, 106], who: 'static_transform_publisher', topic: '/tf_static' },
    { from: [110, 142], to: [110, 194], who: 'circle_broadcaster (odometry)', topic: '/tf, 50 per second' },
  ]
  const leaves = ['camera', 'caster', 'left_wheel', 'right_wheel']
  return (
    <Figure
      height={334}
      label="The frame tree of the Lesson 8 demo. map is the root. Its child odom is published once on /tf_static by static_transform_publisher. odom's child base_link is published on /tf 50 times a second by circle_broadcaster, standing in for odometry. base_link's children camera, caster, left_wheel and right_wheel are published by robot_state_publisher from the rover's URDF and joint states: fixed joints on /tf_static, movable ones on /tf."
      caption={
        <>
          Each arrow is one transform: where the child frame is in the parent frame, and when. Different nodes publish
          different arrows, at different rates, and none of them needs to know about the others. tf2 joins them up: to
          ask where the camera is in <code>map</code>, it chains map → odom → base_link → camera.
        </>
      }
    >
      {[
        ['map', 18, 'the world, as a map of it says'],
        ['odom', 106, 'where odometry started counting'],
        ['base_link', 194, 'the robot'],
      ].map(([name, y, what]) => (
        <g key={name as string}>
          <rect x={40} y={y as number} width={140} height={36} rx={8} className="fig-box-accent" />
          <text x={110} y={(y as number) + 23} textAnchor="middle" className="fig-mono-strong">
            {name}
          </text>
          <text x={196} y={(y as number) + 23} className="fig-small">
            {what}
          </text>
        </g>
      ))}
      {edges.map((e) => (
        <g key={e.who}>
          <line x1={e.from[0]} y1={e.from[1]} x2={e.to[0]} y2={e.to[1] - 2} className="fig-line" markerEnd={arrow('ink')} />
          <text x={124} y={(e.from[1] + e.to[1]) / 2 - 2} className="fig-mono">
            {e.who}
          </text>
          <text x={124} y={(e.from[1] + e.to[1]) / 2 + 14} className="fig-small">
            on {e.topic}
          </text>
        </g>
      ))}
      {leaves.map((name, i) => {
        const cx = 110 + i * 170
        return (
          <g key={name}>
            <path d={`M110,230 C110,262 ${cx},258 ${cx},288`} className="fig-line" markerEnd={arrow('ink')} />
            <rect x={cx - 70} y={290} width={140} height={36} rx={8} className="fig-box" />
            <text x={cx} y={313} textAnchor="middle" className="fig-mono">
              {name}
            </text>
          </g>
        )
      })}
      <text x={330} y={206} className="fig-mono">
        robot_state_publisher, from the rover&apos;s URDF
      </text>
      <text x={330} y={222} className="fig-small">
        fixed joints on /tf_static, moving ones on /tf
      </text>
    </Figure>
  )
}

/** What a tf2 buffer holds, and which lookups it can answer. */
export function BufferTimeline() {
  const x0 = 60
  const x1 = 620
  const now = 560
  const kept = 120
  return (
    <Figure
      height={230}
      label="A timeline of one transform in a tf2 buffer. Samples arrive 50 times a second and the buffer keeps the last ten seconds. A lookup at a time between two samples is answered by interpolating between them. A lookup at TimePointZero gets the latest sample. A lookup older than the oldest sample kept fails with extrapolation into the past; a lookup after the latest sample fails with extrapolation into the future, unless a timeout lets it wait for that sample to arrive."
      caption={
        <>
          A listener stores every transform it hears, for 10 s by default. Asked about a moment, the buffer interpolates
          between the samples on either side of it. It will not guess beyond what it has: before the oldest sample or after
          the newest, the lookup fails with an <em>extrapolation</em> error. A timeout makes it wait for newer data first.
        </>
      }
    >
      <line x1={x0} y1={110} x2={x1} y2={110} className="fig-line-muted" markerEnd={arrow('muted')} />
      <text x={x1} y={132} textAnchor="end" className="fig-small">
        time
      </text>
      <rect x={kept} y={92} width={now - kept} height={36} rx={6} className="col-band" />
      <text x={kept + 6} y={86} className="fig-small">
        kept in the buffer: the last 10 s
      </text>
      {Array.from({ length: 23 }, (_, i) => (
        <circle key={i} cx={kept + 10 + i * 19.5} cy={110} r={3.5} className="fig-dot-s1" />
      ))}
      {[
        { x: 300, label: 'at a past time', sub: 'interpolated', cls: 'fig-line-s1' },
        { x: now - 4, label: 'TimePointZero', sub: 'the latest sample', cls: 'fig-line-s1' },
        { x: 80, label: 'too old', sub: 'extrapolation into the past', cls: 'fig-line-s2' },
        { x: 600, label: 'ahead', sub: 'into the future', cls: 'fig-line-s2' },
      ].map((q) => (
        <g key={q.label}>
          <line x1={q.x} y1={150} x2={q.x} y2={124} className={q.cls} markerEnd={arrow(q.cls === 'fig-line-s1' ? 's1' : 's2')} />
          <text x={q.x} y={168} textAnchor={q.x > 580 ? 'end' : q.x < 100 ? 'start' : 'middle'} className="fig-mono">
            {q.label}
          </text>
          <text x={q.x} y={184} textAnchor={q.x > 580 ? 'end' : q.x < 100 ? 'start' : 'middle'} className="fig-small">
            {q.sub}
          </text>
        </g>
      ))}
      <text x={now} y={40} textAnchor="middle" className="fig-small">
        newest sample
      </text>
      <line x1={now} y1={46} x2={now} y2={90} className="fig-dash fig-line-muted" />
    </Figure>
  )
}
