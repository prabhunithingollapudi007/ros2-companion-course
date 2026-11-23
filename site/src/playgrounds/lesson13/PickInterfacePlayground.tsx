import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { CASES, type Interface } from '../../ros/design'
import '../playgrounds.css'

const KINDS: Interface[] = ['topic', 'service', 'action', 'parameter']

export function PickInterfacePlayground() {
  const [picked, setPicked] = useState<Record<number, Interface>>({})
  const right = CASES.filter((c, i) => picked[i] === c.answer).length
  const done = Object.keys(picked).length

  return (
    <Playground
      title="Pick the interface"
      caption={
        <>
          Ten jobs from a mobile robot. For each, choose how the nodes involved should talk. Some have a second defensible
          answer; the explanation says why the first is usual. {done > 0 && `${right} of ${done} as suggested so far.`}
        </>
      }
    >
      <ol className="pick-list">
        {CASES.map((c, i) => {
          const choice = picked[i]
          return (
            <li key={c.job} className="pick-item">
              <div className="pick-job">{c.job}</div>
              <div className="button-row">
                {KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`btn btn-small ${choice === k ? (k === c.answer ? 'btn-primary' : 'btn-wrong') : ''}`}
                    aria-pressed={choice === k}
                    onClick={() => setPicked((p) => ({ ...p, [i]: k }))}
                  >
                    {k}
                  </button>
                ))}
              </div>
              {choice && (
                <div className="small dim">
                  {choice === c.answer ? 'Yes: ' : `Usually a ${c.answer}: `}
                  {c.why}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </Playground>
  )
}
