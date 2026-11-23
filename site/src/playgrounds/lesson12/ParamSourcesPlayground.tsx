import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { run, type Override } from '../../ros/params'
import '../playgrounds.css'

const RANGE = { from: 0.5, to: 10 }
const DEFAULT = 2.0
const FILE = 1.0

export function ParamSourcesPlayground() {
  const [useFile, setUseFile] = useState(true)
  const [useArg, setUseArg] = useState(true)
  const [argFirst, setArgFirst] = useState(false)
  const [argValue, setArgValue] = useState(4)
  const [setValue, setSetValue] = useState<number | null>(null)
  const [setTo, setSetTo] = useState(5)

  const file: Override = { kind: 'file', value: FILE }
  const arg: Override = { kind: 'arg', value: argValue }
  const overrides = [useFile && file, useArg && arg].filter(Boolean) as Override[]
  if (argFirst) overrides.reverse()
  const outcome = run(DEFAULT, overrides, RANGE, setValue === null ? [] : [setValue])

  const parts = ['ros2 run params_demo blinker']
  if (overrides.length) parts.push('--ros-args')
  for (const o of overrides) parts.push(o.kind === 'file' ? '--params-file porch.yaml' : `-p rate:=${o.value.toFixed(1)}`)

  return (
    <Playground
      title="Where a parameter value comes from"
      caption={
        <>
          The blinker&apos;s <code>rate</code>: declared with a default of 2.0 and a range of 0.5 to 10, overridden by{' '}
          <code>porch.yaml</code> (1.0) and by <code>-p</code>, in the order they are given; the last one wins. Then, while
          it runs, <code>ros2 param set</code>. Every rule here is one the recordings above show.
        </>
      }
    >
      <div className="button-row">
        <button type="button" className={`btn btn-small ${useFile ? 'btn-primary' : ''}`} aria-pressed={useFile} onClick={() => setUseFile((v) => !v)}>
          --params-file porch.yaml
        </button>
        <button type="button" className={`btn btn-small ${useArg ? 'btn-primary' : ''}`} aria-pressed={useArg} onClick={() => setUseArg((v) => !v)}>
          -p rate:=…
        </button>
        <button type="button" className="btn btn-small" disabled={!(useFile && useArg)} onClick={() => setArgFirst((v) => !v)}>
          Swap their order
        </button>
      </div>
      <div className="controls">
        <Slider label="The value given with -p" value={argValue} min={0} max={20} step={0.5} onChange={setArgValue} format={(v) => v.toFixed(1)} />
        <Slider label="A value for ros2 param set, while it runs" value={setTo} min={0} max={20} step={0.5} onChange={setSetTo} format={(v) => v.toFixed(1)} />
      </div>
      <div className="button-row">
        <button type="button" className="btn btn-small btn-primary" disabled={!outcome.started} onClick={() => setSetValue(setTo)}>
          ros2 param set /blinker rate {setTo.toFixed(1)}
        </button>
        <button type="button" className="btn btn-small" disabled={setValue === null} onClick={() => setSetValue(null)}>
          Restart the node
        </button>
      </div>

      <pre className="xacro-text" aria-label="The command">
        {parts.join(' ')}
      </pre>
      <div className="cards">
        {outcome.started ? (
          <>
            <div className="card">
              <div className="card-title">rate is now</div>
              <div className="card-value">{outcome.value.toFixed(1)}</div>
              <div className="card-note">from {outcome.origin}</div>
            </div>
            <div className="card">
              <div className="card-title">ros2 param set</div>
              <div className="card-value">{setValue === null ? '—' : outcome.refused.length ? 'refused' : 'successful'}</div>
              <div className="card-note">
                {setValue === null ? 'not used yet' : outcome.refused.length ? "doesn't comply with floating point range; the old value stays" : 'applied at once'}
              </div>
            </div>
          </>
        ) : (
          <div className="card">
            <div className="card-title">The node does not start</div>
            <div className="card-value">InvalidParameterValueException</div>
            <div className="card-note">{outcome.reason}: declare_parameter throws</div>
          </div>
        )}
      </div>
    </Playground>
  )
}
