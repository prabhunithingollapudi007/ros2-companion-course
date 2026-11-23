import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { callerTimeline, outcomes, type Mode } from '../../ros/deadlock'
import '../playgrounds.css'

const SECONDS = 7
const X0 = 90
const X1 = 700
const x = (t: number) => X0 + (Math.min(t, SECONDS) / SECONDS) * (X1 - X0)
const MODES: { mode: Mode; label: string; what: string }[] = [
  { mode: 'wait', label: 'wait, one thread', what: 'The timer callback waits for the answer. The answer can only be handled by the thread that is waiting for it, so it waits the full 2 s every time, and the answer is handled, too late, after.' },
  { mode: 'groups', label: 'wait, client in its own group, two threads', what: 'Way out 1: the client gets a callback group of its own and the executor a second thread, which handles the answer while the first waits.' },
  { mode: 'callback', label: 'no wait: a response callback', what: 'Way out 2: do not wait at all. Send, return, and handle the answer in a callback of its own when it arrives. One thread is enough.' },
]

export function DeadlockPlayground() {
  const [mode, setMode] = useState<Mode>('wait')
  const blocks = callerTimeline(mode, SECONDS)
  const threads = mode === 'groups' ? 2 : 1
  const result = outcomes(blocks)
  const height = 60 + threads * 50

  return (
    <Playground
      title="A deadlock, and two ways out of it"
      caption={
        <>
          The caller of this lesson, asking <code>/add_two_ints</code> from a timer once a second; the server answers in 50 ms.
          Orange is the timer&apos;s callback, blue the handling of an answer. {MODES.find((m) => m.mode === mode)?.what}
        </>
      }
    >
      <div className="button-row">
        {MODES.map((m) => (
          <button key={m.mode} type="button" className={`btn btn-small ${mode === m.mode ? 'btn-primary' : ''}`} aria-pressed={mode === m.mode} onClick={() => setMode(m.mode)}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="figure-scroll">
        <svg viewBox={`0 0 720 ${height}`} className="graph-svg" role="img" aria-label={`In ${SECONDS} seconds: ${result.filter((r) => r === 'answer').length} answers and ${result.filter((r) => r === 'timeout').length} timeouts.`}>
          {Array.from({ length: threads }, (_, t) => (
            <g key={t}>
              <text x={10} y={40 + t * 50} className="fig-small">
                thread {t + 1}
              </text>
              <line x1={X0} y1={36 + t * 50} x2={X1} y2={36 + t * 50} className="fig-line-muted" />
            </g>
          ))}
          {blocks.map((b, i) => (
            <rect
              key={i}
              x={x(b.start)}
              y={(b.what === 'timer' ? 22 : 26) + b.thread * 50}
              width={Math.max(3, x(b.end) - x(b.start))}
              height={b.what === 'timer' ? 28 : 20}
              rx={3}
              className={b.what === 'timer' ? 'fig-fill-s2' : 'fig-fill-s1'}
              opacity={b.what === 'timer' ? 0.75 : 1}
            />
          ))}
          {Array.from({ length: SECONDS + 1 }, (_, s) => (
            <text key={s} x={x(s)} y={height - 10} textAnchor="middle" className="fig-small">
              {s} s
            </text>
          ))}
        </svg>
      </div>
      <pre className="xacro-text" aria-label="What the caller logs">
        {result.map((r, i) => (r === 'answer' ? `[INFO] [caller]: ${i + 1} + 100 = ${i + 101}` : `[WARN] [caller]: ${i + 1} + 100: no answer after 2 s`)).join('\n')}
      </pre>
    </Playground>
  )
}
