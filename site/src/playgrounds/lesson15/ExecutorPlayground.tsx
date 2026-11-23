import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { busyNode, count, simulate } from '../../ros/executor'
import '../playgrounds.css'

const SECONDS = 4.5
const X0 = 90
const X1 = 700
const x = (t: number) => X0 + (t / SECONDS) * (X1 - X0)

export function ExecutorPlayground() {
  const [threads, setThreads] = useState(1)
  const [separate, setSeparate] = useState(false)
  const [work, setWork] = useState(1.5)
  const runs = simulate(busyNode(separate, work), threads, SECONDS)
  const fast = count(runs, 'fast')
  const height = 50 + threads * 50

  return (
    <Playground
      title="An executor running callbacks, thread by thread"
      caption={
        <>
          busy_node&apos;s two timers for 4.5 s: a slow one every 2 s that works for a while, and a fast one every 0.1 s. Each
          row is one of the executor&apos;s threads; each block a callback running on it. With one thread, or with both
          timers in the same mutually exclusive group, the fast timer waits; when it can run again it fires once, not once
          for each tick it missed.
        </>
      }
    >
      <div className="button-row">
        {[1, 2].map((n) => (
          <button key={n} type="button" className={`btn btn-small ${threads === n ? 'btn-primary' : ''}`} aria-pressed={threads === n} onClick={() => setThreads(n)}>
            {n === 1 ? 'SingleThreadedExecutor' : 'MultiThreadedExecutor, 2 threads'}
          </button>
        ))}
        <button type="button" className={`btn btn-small ${separate ? 'btn-primary' : ''}`} aria-pressed={separate} onClick={() => setSeparate((v) => !v)}>
          {separate ? 'a group for each timer' : 'both timers in the default group'}
        </button>
      </div>
      <div className="controls">
        <Slider label="The slow callback's work" value={work} min={0.1} max={1.9} step={0.1} onChange={setWork} format={(v) => `${v.toFixed(1)} s`} />
      </div>
      <div className="figure-scroll">
        <svg viewBox={`0 0 720 ${height}`} className="graph-svg" role="img" aria-label={`The fast timer ran ${fast} times in ${SECONDS} seconds.`}>
          {Array.from({ length: threads }, (_, t) => (
            <g key={t}>
              <text x={10} y={40 + t * 50} className="fig-small">
                thread {t + 1}
              </text>
              <line x1={X0} y1={36 + t * 50} x2={X1} y2={36 + t * 50} className="fig-line-muted" />
            </g>
          ))}
          {runs.map((r, i) =>
            r.name === 'slow' ? (
              <rect key={i} x={x(r.start)} y={22 + r.thread * 50} width={Math.max(2, x(Math.min(r.end, SECONDS)) - x(r.start))} height={28} rx={4} className="fig-fill-s2" opacity={0.8} />
            ) : (
              <rect key={i} x={x(r.start) - 1} y={26 + r.thread * 50} width={3} height={20} className="fig-fill-s1" />
            ),
          )}
          {[0, 1, 2, 3, 4].map((s) => (
            <text key={s} x={x(s)} y={height - 8} textAnchor="middle" className="fig-small">
              {s} s
            </text>
          ))}
        </svg>
      </div>
      <div className="cards">
        <div className="card">
          <div className="card-title">fast timer (blue)</div>
          <div className="card-value">{fast} runs</div>
          <div className="card-note">{Math.round(SECONDS / 0.1)} if nothing held it up</div>
        </div>
        <div className="card">
          <div className="card-title">slow timer (orange)</div>
          <div className="card-value">{count(runs, 'slow')} runs</div>
          <div className="card-note">every 2 s, {work.toFixed(1)} s of work each</div>
        </div>
      </div>
    </Playground>
  )
}
