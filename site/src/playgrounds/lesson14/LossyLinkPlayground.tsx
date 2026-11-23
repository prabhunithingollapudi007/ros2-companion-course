import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { deliver, type Delivery } from '../../ros/qos'
import '../playgrounds.css'

const N = 30
const PERIOD = 0.1
const DELAY = 0.02
const X0 = 70
const X1 = 700
const END = 4
const x = (t: number) => X0 + (Math.min(t, END) / END) * (X1 - X0)

function Lane({ y, title, deliveries }: { y: number; title: string; deliveries: Delivery[] }) {
  return (
    <g>
      <text x={10} y={y - 18} className="fig-label">
        {title}
      </text>
      <line x1={X0} y1={y} x2={X1} y2={y} className="fig-line-muted" />
      <line x1={X0} y1={y + 34} x2={X1} y2={y + 34} className="fig-line-muted" />
      <text x={10} y={y + 4} className="fig-small">
        sent
      </text>
      <text x={10} y={y + 38} className="fig-small">
        received
      </text>
      {deliveries.map((d, i) => (
        <g key={i}>
          <circle cx={x(d.sent)} cy={y} r={3} className="fig-fill-ink" />
          {d.at === null ? (
            <text x={x(d.sent)} y={y + 20} textAnchor="middle" className="fig-small">
              ✗
            </text>
          ) : (
            <>
              <line x1={x(d.sent)} y1={y + 3} x2={x(d.at)} y2={y + 31} className="fig-line-s1" opacity={0.5} />
              <circle cx={x(d.at)} cy={y + 34} r={3} className="fig-dot-s1" />
            </>
          )}
        </g>
      ))}
    </g>
  )
}

const stats = (ds: Delivery[]) => {
  const got = ds.filter((d) => d.at !== null) as { sent: number; at: number }[]
  const lat = got.map((d) => d.at - d.sent)
  return {
    got: got.length,
    worst: lat.length ? Math.max(...lat) : 0,
    mean: lat.length ? lat.reduce((a, b) => a + b, 0) / lat.length : 0,
  }
}

export function LossyLinkPlayground() {
  const [loss, setLoss] = useState(0.2)
  const best = deliver(N, PERIOD, loss, DELAY, 'best_effort')
  const rel = deliver(N, PERIOD, loss, DELAY, 'reliable')
  const b = stats(best)
  const r = stats(rel)

  return (
    <Playground
      title="A lossy link: reliable against best-effort"
      caption={
        <>
          Thirty messages, ten a second, over a link that loses some packets, such as Wi-Fi at the edge of its range. Best
          effort sends each once: what is lost is gone, and the rest arrive on time. Reliable resends what is lost: everything
          arrives, but late, and because messages are handed over in order, one late message holds up the ones behind it.
        </>
      }
    >
      <div className="controls">
        <Slider label="Packets lost" value={loss} min={0} max={0.6} step={0.05} onChange={setLoss} format={(v) => `${Math.round(v * 100)} %`} />
      </div>
      <div className="figure-scroll">
        <svg viewBox="0 0 720 230" className="graph-svg" role="img" aria-label={`Best effort delivered ${b.got} of ${N}; reliable delivered ${r.got}, the latest ${Math.round(r.worst * 1000)} ms late.`}>
          <Lane y={50} title="best_effort" deliveries={best} />
          <Lane y={150} title="reliable" deliveries={rel} />
          {[0, 1, 2, 3, 4].map((s) => (
            <text key={s} x={x(s)} y={222} textAnchor="middle" className="fig-small">
              {s} s
            </text>
          ))}
        </svg>
      </div>
      <div className="cards">
        <div className="card">
          <div className="card-title">best_effort</div>
          <div className="card-value">
            {b.got} of {N} arrive
          </div>
          <div className="card-note">each after {Math.round(DELAY * 1000)} ms</div>
        </div>
        <div className="card">
          <div className="card-title">reliable</div>
          <div className="card-value">
            {r.got} of {N} arrive
          </div>
          <div className="card-note">
            on average after {Math.round(r.mean * 1000)} ms, the latest after {Math.round(r.worst * 1000)} ms
          </div>
        </div>
      </div>
    </Playground>
  )
}
