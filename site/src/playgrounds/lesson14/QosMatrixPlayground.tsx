import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { POLICY_NAME, compatible, type Durability, type Qos, type Reliability } from '../../ros/qos'
import '../playgrounds.css'

const RELIABILITIES: Reliability[] = ['reliable', 'best_effort']
const DURABILITIES: Durability[] = ['transient_local', 'volatile']
const ALL: Qos[] = RELIABILITIES.flatMap((reliability) => DURABILITIES.map((durability) => ({ reliability, durability })))
const label = (q: Qos) => `${POLICY_NAME[q.reliability]}, ${POLICY_NAME[q.durability]}`

export function QosMatrixPlayground() {
  const [cell, setCell] = useState<[number, number]>([2, 0])
  const pub = ALL[cell[0]]
  const sub = ALL[cell[1]]
  const result = compatible(pub, sub)

  return (
    <Playground
      title="The QoS compatibility matrix"
      caption={
        <>
          Rows are what a publisher offers, columns what a subscription requests. They connect when the offer is at least
          the request: reliable satisfies a best-effort request but not the other way round, and transient local satisfies
          a volatile request but not the other way round. Click a cell.
        </>
      }
    >
      <div className="table-scroll">
        <table className="qos-matrix">
          <thead>
            <tr>
              <th>Publisher offers ↓ / subscription requests →</th>
              {ALL.map((q) => (
                <th key={label(q)} className="mono small">
                  {label(q)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL.map((p, i) => (
              <tr key={label(p)}>
                <th className="mono small">{label(p)}</th>
                {ALL.map((s, j) => {
                  const r = compatible(p, s)
                  const here = cell[0] === i && cell[1] === j
                  return (
                    <td key={label(s)}>
                      <button
                        type="button"
                        className={`qos-cell ${r.ok ? 'is-ok' : 'is-bad'} ${here ? 'is-here' : ''}`}
                        aria-pressed={here}
                        onClick={() => setCell([i, j])}
                      >
                        {r.ok ? '✓' : '✗'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <pre className="xacro-text" aria-live="polite">
        {result.ok
          ? `Publisher (${label(pub)}) and subscription (${label(sub)}) connect.`
          : `[WARN] [subscriber]: New publisher discovered on topic '/chatter', offering incompatible QoS.\nNo messages will be sent to it. Last incompatible policy: ${result.policy}`}
      </pre>
    </Playground>
  )
}
