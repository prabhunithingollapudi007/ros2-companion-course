import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { CARRIER, START, STATUS, allowed, finished, step, type Goal, type GoalEvent, type GoalState } from '../../ros/action'
import '../playgrounds.css'

// Where each state sits in the drawing.
const BOXES: { state: GoalState; x: number; y: number; label: string }[] = [
  { state: 'none', x: 20, y: 110, label: 'sent' },
  { state: 'rejected', x: 170, y: 200, label: 'rejected' },
  { state: 'accepted', x: 170, y: 40, label: 'ACCEPTED' },
  { state: 'executing', x: 330, y: 40, label: 'EXECUTING' },
  { state: 'canceling', x: 330, y: 170, label: 'CANCELING' },
  { state: 'succeeded', x: 520, y: 20, label: 'SUCCEEDED' },
  { state: 'aborted', x: 520, y: 100, label: 'ABORTED' },
  { state: 'canceled', x: 520, y: 180, label: 'CANCELED' },
]
const W = 130
const H = 40
const centre = (s: GoalState) => {
  const b = BOXES.find((x) => x.state === s)!
  return [b.x + W / 2, b.y + H / 2] as const
}
const EDGES: [GoalState, GoalState][] = [
  ['none', 'accepted'],
  ['none', 'rejected'],
  ['accepted', 'executing'],
  ['accepted', 'canceling'],
  ['executing', 'canceling'],
  ['executing', 'succeeded'],
  ['executing', 'aborted'],
  ['canceling', 'canceled'],
  ['canceling', 'aborted'],
]
const LABEL: Record<GoalEvent, string> = {
  send: 'Client: send a goal',
  accept: 'Server: accept it',
  reject: 'Server: reject it',
  execute: 'Server: start work',
  feedback: 'Server: send feedback',
  cancel: 'Client: ask to cancel',
  succeed: 'Server: finish, done',
  'finish canceled': 'Server: stop, canceled',
  abort: 'Server: give up (abort)',
}

export function GoalLifePlayground() {
  const [goal, setGoal] = useState<Goal>(START)
  const [log, setLog] = useState<{ event: GoalEvent; state: GoalState }[]>([])
  const act = (event: GoalEvent) => {
    const next = step(goal, event)
    setGoal(next)
    setLog((old) => [...old, { event, state: next.state }])
  }

  return (
    <Playground
      title="The life of a goal"
      caption={
        <>
          Play both sides: the buttons are what may happen next, and only that. The status names are the ones in{' '}
          <code>action_msgs/msg/GoalStatus</code>, which <code>ros2 action send_goal</code> prints at the end. The log says
          which of the action&apos;s three services and two topics carries each step.
        </>
      }
    >
      <div className="button-row">
        {allowed(goal).map((e) => (
          <button key={e} type="button" className="btn btn-small btn-primary" onClick={() => act(e)}>
            {LABEL[e]}
          </button>
        ))}
        {goal.sent && (
          <button
            type="button"
            className="btn btn-small"
            onClick={() => {
              setGoal(START)
              setLog([])
            }}
          >
            Start over
          </button>
        )}
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 680 250" className="graph-svg" role="img" aria-label={`The goal is ${goal.sent ? (STATUS[goal.state]?.name ?? goal.state) : 'not sent yet'}.`}>
          {EDGES.map(([a, b]) => {
            const [x1, y1] = centre(a)
            const [x2, y2] = centre(b)
            return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className="fig-line-muted" />
          })}
          {BOXES.map((b) => {
            const here = goal.sent && goal.state === b.state
            const done = ['succeeded', 'canceled', 'aborted', 'rejected'].includes(b.state)
            return (
              <g key={b.state}>
                <rect x={b.x} y={b.y} width={W} height={H} rx={done ? 18 : 8} className={here ? 'fig-box-accent' : 'fig-box'} strokeWidth={here ? 3 : 1} />
                <text x={b.x + W / 2} y={b.y + 25} textAnchor="middle" className={here ? 'fig-mono-strong' : 'fig-mono'}>
                  {b.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {log.length > 0 && (
        <ol className="resolve-steps">
          {log.map((l, i) => (
            <li key={i}>
              {LABEL[l.event]}: <em>{CARRIER[l.event]}</em>
              {STATUS[l.state] && l.event !== 'feedback' ? ` → ${STATUS[l.state]!.name}` : ''}
            </li>
          ))}
        </ol>
      )}
      {finished(goal) && <p className="small dim">The goal is over. A client wanting more sends a new goal.</p>}
    </Playground>
  )
}
