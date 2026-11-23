import { useMemo, useState } from 'react'
import { Playground, Slider, Stat } from '../../components/Playground'
import { simulateQueue } from '../../ros/queue'
import '../playgrounds.css'

const SECONDS = 4
const W = 720
const X0 = 40
const X1 = 700
const x = (t: number) => X0 + (t / SECONDS) * (X1 - X0)

export function QueuePlayground() {
  const [rate, setRate] = useState(20)
  const [ms, setMs] = useState(250)
  const [depth, setDepth] = useState(3)

  const run = useMemo(() => simulateQueue(rate, ms / 1000, depth, SECONDS), [rate, ms, depth])
  const handledSet = new Set(run.handled.map((h) => h.n))
  const droppedSet = new Set(run.dropped)
  const published = Math.floor(SECONDS * rate)
  const tickW = Math.max(1.5, Math.min(10, ((X1 - X0) / published) * 0.7))

  return (
    <Playground
      title="A queue that cannot keep up"
      caption={
        <>
          A publisher sends numbered messages; the subscriber's callback takes a fixed time for each. Messages that
          arrive meanwhile wait in its queue, and once the queue is full the oldest waiting message is dropped. The
          starting values are the ones recorded above: 20 messages a second, 250 ms each, a queue of 3. The model
          reproduces both recordings: every fifth message handled with a queue of 3, every message with a queue of 100.
        </>
      }
    >
      <div className="controls controls-3">
        <Slider label="Messages per second" value={rate} min={1} max={40} step={1} onChange={setRate} />
        <Slider label="Callback takes" value={ms} min={10} max={500} step={10} onChange={setMs} format={(v) => `${v} ms`} />
        <Slider label="Queue depth" value={depth} min={1} max={100} step={1} onChange={setDepth} />
      </div>

      <div className="figure-scroll">
        <svg viewBox={`0 0 ${W} 160`} className="graph-svg" role="img" aria-label={`Over ${SECONDS} seconds: ${run.handled.length} messages handled, ${run.dropped.length} dropped, ${run.waiting} still waiting.`}>
          <text x={X0} y={18} className="fig-label">
            Messages as they arrive
          </text>
          {Array.from({ length: published }, (_, i) => i + 1).map((n) => {
            const kind = handledSet.has(n) ? 'handled' : droppedSet.has(n) ? 'dropped' : 'waiting'
            return <rect key={n} x={x(n / rate) - tickW / 2} y={28} width={tickW} height={34} rx={1.5} className={`q-tick q-${kind}`} />
          })}
          <text x={X0} y={88} className="fig-label">
            Callback busy
          </text>
          {run.handled.map((h) => (
            <g key={h.n}>
              <rect x={x(h.at)} y={96} width={Math.max(1, x(h.at + ms / 1000) - x(h.at) - 1)} height={26} rx={3} className="q-busy" />
              {x(h.at + ms / 1000) - x(h.at) > 22 && (
                <text x={x(h.at) + 4} y={114} className="q-busy-label">
                  {h.n}
                </text>
              )}
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((t) => (
            <text key={t} x={x(t)} y={150} textAnchor="middle" className="fig-small">
              {t} s
            </text>
          ))}
        </svg>
      </div>
      <ul className="swatches">
        <li>
          <span className="swatch q-handled-swatch" /> handled
        </li>
        <li>
          <span className="swatch q-dropped-swatch" /> dropped
        </li>
        <li>
          <span className="swatch q-waiting-swatch" /> still waiting
        </li>
      </ul>

      <div className="stats">
        <Stat label="Handled" value={run.handled.length} note={`${(run.handled.length / SECONDS).toFixed(1)} a second`} />
        <Stat label="Dropped" value={run.dropped.length} />
        <Stat
          label="Waiting at the end"
          value={run.waiting}
          note={run.dropped.length > 0 ? 'the queue is full: new messages push out old ones' : run.waiting > 2 ? 'the backlog is growing' : undefined}
        />
      </div>
    </Playground>
  )
}
