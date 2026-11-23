import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { latestAt, publishTimes, serve } from '../../ros/service'
import '../playgrounds.css'

const END = 8
const Y0 = 50
const Y1 = 330
const y = (t: number) => Y0 + (Math.min(t, END) / END) * (Y1 - Y0)
const LANES = { A: 120, server: 360, B: 600 }
const s1 = (v: number) => `${v.toFixed(1)} s`

export function TopicOrServicePlayground() {
  const [asService, setAsService] = useState(true)
  const [aAt, setAAt] = useState(1)
  const [bAt, setBAt] = useState(1.5)
  const [upAt, setUpAt] = useState(0)
  const [work, setWork] = useState(1)

  const calls = [
    { client: 'A', at: aAt },
    { client: 'B', at: bAt },
  ]
  const answered = serve(calls, upAt, work)
  const published = publishTimes(upAt, 1, END)

  return (
    <Playground
      title="The same exchange as a topic and as a service"
      caption={
        <>
          Two nodes, A and B, each want the count at a moment you choose. As a topic, the counter publishes once a second to
          whoever listens, and each reader takes the latest message: no waiting, but it may be up to a second old, and
          there is nothing at all before the counter starts. As a service, each asks and gets its own answer, made for it,
          but must wait for the server to exist and to finish the requests before its own.
        </>
      }
    >
      <div className="button-row">
        <button type="button" className={`btn btn-small ${!asService ? 'btn-primary' : ''}`} aria-pressed={!asService} onClick={() => setAsService(false)}>
          As a topic
        </button>
        <button type="button" className={`btn btn-small ${asService ? 'btn-primary' : ''}`} aria-pressed={asService} onClick={() => setAsService(true)}>
          As a service
        </button>
      </div>
      <div className="controls">
        <Slider label="A wants the count at" value={aAt} min={0} max={6} step={0.1} onChange={setAAt} format={s1} />
        <Slider label="B wants the count at" value={bAt} min={0} max={6} step={0.1} onChange={setBAt} format={s1} />
        <Slider label="The counter starts at" value={upAt} min={0} max={5} step={0.1} onChange={setUpAt} format={s1} />
        <Slider
          label="Time the server takes per request"
          value={work}
          min={0.1}
          max={3}
          step={0.1}
          onChange={setWork}
          format={s1}
          hint={asService ? undefined : 'only matters for the service'}
        />
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 350" className="graph-svg" role="img" aria-label={asService ? answered.map((a) => `${a.client} waits ${(a.answered - a.at).toFixed(1)} seconds.`).join(' ') : 'The counter publishes once a second to both.'}>
          {(['A', 'server', 'B'] as const).map((lane) => (
            <g key={lane}>
              <text x={LANES[lane]} y={24} textAnchor="middle" className="fig-mono-strong">
                {lane === 'server' ? 'counter' : lane}
              </text>
              <line x1={LANES[lane]} y1={Y0 - 10} x2={LANES[lane]} y2={Y1 + 6} className="fig-line-muted fig-dash" />
            </g>
          ))}
          <rect x={LANES.server - 8} y={y(upAt)} width={16} height={Y1 - y(upAt)} rx={3} className="col-band" />
          {Array.from({ length: END + 1 }, (_, t) => (
            <text key={t} x={20} y={y(t) + 4} className="fig-small">
              {t} s
            </text>
          ))}

          {asService
            ? answered.map((a) => {
                const x = LANES[a.client as 'A' | 'B']
                const side = x < LANES.server ? 1 : -1
                return (
                  <g key={a.client}>
                    <rect x={x - 5} y={y(a.at)} width={10} height={Math.max(1, y(a.answered) - y(a.at))} rx={3} className="fig-fill-s2" opacity={0.35} />
                    <line x1={x} y1={y(a.sent)} x2={LANES.server - side * 10} y2={y(a.sent)} className="fig-line-s1" markerEnd="url(#svc-arrow)" />
                    <rect x={LANES.server - 6} y={y(a.started)} width={12} height={Math.max(1, y(a.answered) - y(a.started))} className="fig-fill-s1" />
                    <line x1={LANES.server} y1={y(a.answered)} x2={x + side * 8} y2={y(a.answered)} className="fig-line-s2" markerEnd="url(#svc-arrow-2)" />
                    <text x={(x + LANES.server) / 2} y={y(a.sent) - 5} textAnchor="middle" className="fig-small">
                      request
                    </text>
                    <text x={(x + LANES.server) / 2} y={y(a.answered) + 14} textAnchor="middle" className="fig-small">
                      response, after {(a.answered - a.at).toFixed(1)} s
                    </text>
                  </g>
                )
              })
            : published.map((t) => (
                <g key={t}>
                  <line x1={LANES.server} y1={y(t)} x2={LANES.A + 8} y2={y(t)} className="fig-line-s1" opacity={0.5} markerEnd="url(#svc-arrow)" />
                  <line x1={LANES.server} y1={y(t)} x2={LANES.B - 8} y2={y(t)} className="fig-line-s1" opacity={0.5} markerEnd="url(#svc-arrow)" />
                </g>
              ))}
          {!asService &&
            calls.map((c) => {
              const x = LANES[c.client as 'A' | 'B']
              const got = latestAt(c.at, published)
              return (
                <g key={c.client}>
                  <circle cx={x} cy={y(c.at)} r={6} className="fig-dot-s2" />
                  <text x={x + (x < LANES.server ? -12 : 12)} y={y(c.at) + 4} textAnchor={x < LANES.server ? 'end' : 'start'} className="fig-small">
                    {got ? `${got.age.toFixed(1)} s old` : 'nothing yet'}
                  </text>
                </g>
              )
            })}
          <defs>
            <marker id="svc-arrow" markerWidth={10} markerHeight={10} refX={8.5} refY={5} orient="auto">
              <path d="M0,1 L9,5 L0,9 Z" className="fig-fill-s1" />
            </marker>
            <marker id="svc-arrow-2" markerWidth={10} markerHeight={10} refX={8.5} refY={5} orient="auto">
              <path d="M0,1 L9,5 L0,9 Z" className="fig-fill-s2" />
            </marker>
          </defs>
        </svg>
      </div>
    </Playground>
  )
}
