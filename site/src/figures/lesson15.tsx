import { arrow } from './arrows'
import { Figure } from './Figure'

/** Where callbacks come from, and what decides when they run. */
export function ExecutorLoop() {
  const sources = ['timers that are due', 'messages that arrived', 'service requests', 'service answers', 'action goals and results']
  return (
    <Figure
      height={260}
      label="On the left, the things that make callbacks ready: timers that are due, messages, service requests, service answers, action goals and results. In the middle, the executor waits until something is ready, picks a ready callback whose group allows it to run, and runs it on a free thread. On the right, its threads: one for a single-threaded executor, several for a multi-threaded one."
      caption={
        <>
          Nothing in a node runs by itself. The executor waits until something is ready, then runs its callback on one of its
          threads, but only if that callback&apos;s <strong>group</strong> allows it: a mutually exclusive group runs one of its
          callbacks at a time, a reentrant group any number. Each node has a default group, mutually exclusive.
        </>
      }
    >
      {sources.map((s, i) => (
        <g key={s}>
          <rect x={20} y={20 + i * 44} width={200} height={32} rx={7} className="fig-box" />
          <text x={32} y={41 + i * 44} className="fig-small">
            {s}
          </text>
          <line x1={222} y1={36 + i * 44} x2={286} y2={128} className="fig-line-muted" markerEnd={arrow('muted')} />
        </g>
      ))}
      <rect x={290} y={70} width={190} height={116} rx={12} className="fig-box-accent" />
      <text x={385} y={96} textAnchor="middle" className="fig-mono-strong">
        executor
      </text>
      {['wait until ready', 'pick a callback its', 'group lets run', 'run it on a free thread'].map((t, i) => (
        <text key={t} x={385} y={118 + i * 17} textAnchor="middle" className="fig-small">
          {t}
        </text>
      ))}
      {[0, 1].map((t) => (
        <g key={t}>
          <line x1={482} y1={118 + t * 30} x2={536} y2={98 + t * 64} className="fig-line" markerEnd={arrow('ink')} />
          <rect x={540} y={80 + t * 64} width={160} height={36} rx={8} className="fig-box" />
          <text x={620} y={103 + t * 64} textAnchor="middle" className="fig-mono">
            thread {t + 1}
          </text>
        </g>
      ))}
      <text x={620} y={226} textAnchor="middle" className="fig-small">
        one for SingleThreadedExecutor,
      </text>
      <text x={620} y={242} textAnchor="middle" className="fig-small">
        several for MultiThreadedExecutor
      </text>
    </Figure>
  )
}
