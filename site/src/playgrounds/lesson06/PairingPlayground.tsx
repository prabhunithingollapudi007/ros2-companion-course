import { useMemo, useState } from 'react'
import { Playground, Slider, Stat } from '../../components/Playground'
import { exactPairs, nearestPairs, stamps } from '../../ros/pairing'
import '../playgrounds.css'

const SECONDS = 6
const X0 = 110
const X1 = 700
const x = (t: number) => X0 + (t / SECONDS) * (X1 - X0)
const ROW_T = 46
const ROW_H = 118

export function PairingPlayground() {
  const [tempRate, setTempRate] = useState(4)
  const [humRate, setHumRate] = useState(1)
  const [humOffset, setHumOffset] = useState(0.11)
  const [exact, setExact] = useState(false)
  const [slop, setSlop] = useState(0.5)

  const temp = useMemo(() => stamps(tempRate, 0.03, SECONDS), [tempRate])
  const hum = useMemo(() => stamps(humRate, humOffset, SECONDS), [humRate, humOffset])
  const pairs = useMemo(() => (exact ? exactPairs(temp, hum) : nearestPairs(hum, temp, slop)), [exact, temp, hum, slop])
  const pairedTemp = new Set(pairs.map(([t]) => t))
  const pairedHum = new Set(pairs.map(([, h]) => h))

  return (
    <Playground
      title="Pairing two sensors by time stamp"
      caption={
        <>
          The start values are the weather bag&apos;s: temperature 4 times a second from 0.03 s, humidity once a second
          from 0.11 s. Matching only equal stamps finds nothing, because two sensors are never read at exactly the same
          instant. Pairing each humidity reading with the nearest temperature reading gives the pairs that{' '}
          <code>pair_printer</code> printed in the recording above. message_filters&apos; ApproximateTime policy is more
          general than &quot;nearest&quot;, but for streams like these it makes the same choice.
        </>
      }
    >
      <div className="button-row">
        <button type="button" className={`btn btn-small ${exact ? '' : 'btn-primary'}`} aria-pressed={!exact} onClick={() => setExact(false)}>
          Approximate: nearest in time
        </button>
        <button type="button" className={`btn btn-small ${exact ? 'btn-primary' : ''}`} aria-pressed={exact} onClick={() => setExact(true)}>
          Exact: equal stamps only
        </button>
      </div>
      <div className="controls">
        <Slider label="Temperature readings a second" value={tempRate} min={1} max={10} step={1} onChange={setTempRate} />
        <Slider label="Humidity readings a second" value={humRate} min={0.5} max={4} step={0.5} onChange={setHumRate} />
        <Slider label="Humidity read this long after 0 s" value={humOffset} min={0} max={0.5} step={0.01} onChange={setHumOffset} format={(v) => `${v.toFixed(2)} s`} />
        {!exact && <Slider label="Furthest apart a pair may be" value={slop} min={0.02} max={1} step={0.01} onChange={setSlop} format={(v) => `${v.toFixed(2)} s`} />}
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 170" className="graph-svg" role="img" aria-label={`${pairs.length} pairs in ${SECONDS} seconds.`}>
          <text x={16} y={ROW_T + 4} className="fig-strong">
            temperature
          </text>
          <text x={16} y={ROW_H + 4} className="fig-strong">
            humidity
          </text>
          {pairs.map(([t, h]) => (
            <line key={`${t}-${h}`} x1={x(t)} y1={ROW_T + 9} x2={x(h)} y2={ROW_H - 9} className="fig-line-s1" />
          ))}
          {temp.map((t) => (
            <circle key={`t${t}`} cx={x(t)} cy={ROW_T} r={6} className={pairedTemp.has(t) ? 'fig-dot-s1' : 'pair-unused'} />
          ))}
          {hum.map((h) => (
            <circle key={`h${h}`} cx={x(h)} cy={ROW_H} r={7} className={pairedHum.has(h) ? 'fig-dot-s2' : 'pair-unused'} />
          ))}
          {Array.from({ length: SECONDS + 1 }, (_, s) => (
            <text key={s} x={x(s)} y={160} textAnchor="middle" className="fig-small">
              {s} s
            </text>
          ))}
        </svg>
      </div>

      <div className="stats">
        <Stat label="Pairs" value={pairs.length} note={`in ${SECONDS} s`} />
        <Stat label="Humidity readings left unpaired" value={hum.length - pairedHum.size} />
        <Stat label="Temperature readings used" value={`${pairedTemp.size} of ${temp.length}`} />
      </div>
    </Playground>
  )
}
