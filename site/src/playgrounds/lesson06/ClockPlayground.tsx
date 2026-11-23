import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { nodeClock, timerTicks, type ClockSetup } from '../../ros/clock'
import '../playgrounds.css'

const SECONDS = 8
const PLAY_AT = 2
const BAG_START = 1_780_000_000
const WALL_START = 1_795_000_000
const X0 = 60
const X1 = 700
const x = (t: number) => X0 + (t / SECONDS) * (X1 - X0)

const date = (seconds: number) => (seconds === 0 ? '1970-01-01 (zero)' : new Date(seconds * 1000).toISOString().slice(0, 19).replace('T', ' '))

export function ClockPlayground() {
  const [simTime, setSimTime] = useState(true)
  const [clock, setClock] = useState(true)
  const [rate, setRate] = useState(1)
  const [t, setT] = useState(5)

  const setup: ClockSetup = { simTime, clock, rate, playAt: PLAY_AT }
  const reading = nodeClock(t, setup, WALL_START, BAG_START)
  const ticks = timerTicks(setup, SECONDS)

  return (
    <Playground
      title="Whose clock is it?"
      caption={
        <>
          A node with a once-a-second timer, like <code>what_time.py</code>, starts at 0 s; the bag starts playing at{' '}
          {PLAY_AT} s. Each dot is a timer tick. The model reproduces the recordings above: the computer&apos;s date
          without <code>use_sim_time</code>, nothing at all before <code>/clock</code> arrives, the bag&apos;s date in
          May 2026 once it does, and ticks twice as often at <code>--rate 2</code>.
        </>
      }
    >
      <div className="button-row">
        <button type="button" className={`btn btn-small ${simTime ? 'btn-primary' : ''}`} aria-pressed={simTime} onClick={() => setSimTime((v) => !v)}>
          use_sim_time: {simTime ? 'true' : 'false'}
        </button>
        <button type="button" className={`btn btn-small ${clock ? 'btn-primary' : ''}`} aria-pressed={clock} onClick={() => setClock((v) => !v)}>
          ros2 bag play {clock ? '--clock' : '(without --clock)'}
        </button>
      </div>
      <div className="controls">
        <Slider label="Play rate (--rate)" value={rate} min={0.5} max={4} step={0.5} onChange={setRate} format={(v) => `${v}×`} />
        <Slider label="Real time since the node started" value={t} min={0} max={SECONDS} step={0.1} onChange={setT} format={(v) => `${v.toFixed(1)} s`} />
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 120" className="graph-svg" role="img" aria-label={`The timer fires ${ticks.length} times in ${SECONDS} seconds.`}>
          <rect x={x(PLAY_AT)} y={20} width={X1 - x(PLAY_AT)} height={50} rx={6} className="col-band" />
          <text x={x(PLAY_AT) + 6} y={34} className="fig-label">
            bag playing
          </text>
          <line x1={X0} y1={60} x2={X1} y2={60} className="fig-line-muted" />
          {ticks.map((tick) => (
            <circle key={tick} cx={x(tick)} cy={60} r={6} className="fig-dot-s1" />
          ))}
          <line x1={x(t)} y1={14} x2={x(t)} y2={80} className="fig-line" />
          {Array.from({ length: SECONDS + 1 }, (_, s) => (
            <text key={s} x={x(s)} y={104} textAnchor="middle" className="fig-small">
              {s} s
            </text>
          ))}
        </svg>
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-title">The node&apos;s clock now reads</div>
          <div className="card-value mono">{reading.toFixed(1)} s</div>
          <div className="card-note">{date(Math.floor(reading))} UTC</div>
        </div>
        <div className="card">
          <div className="card-title">Timer ticks so far</div>
          <div className="card-value">{ticks.filter((k) => k <= t).length}</div>
          <div className="card-note">{simTime && !clock ? 'none: nothing publishes /clock' : `${ticks.length} in ${SECONDS} s`}</div>
        </div>
      </div>
    </Playground>
  )
}
