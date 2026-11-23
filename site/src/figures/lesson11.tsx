import { arrow } from './arrows'
import { Figure } from './Figure'

/** An action is three services and two topics under one name. */
export function ActionParts() {
  const rows: { name: string; kind: 'service' | 'topic'; dir: 'right' | 'left' | 'both'; what: string }[] = [
    { name: 'send_goal', kind: 'service', dir: 'both', what: 'the goal; accepted or rejected' },
    { name: 'feedback', kind: 'topic', dir: 'left', what: 'progress, while it works' },
    { name: 'status', kind: 'topic', dir: 'left', what: 'every goal’s state' },
    { name: 'cancel_goal', kind: 'service', dir: 'both', what: 'please stop; whether it will' },
    { name: 'get_result', kind: 'service', dir: 'both', what: 'the result, once it is over' },
  ]
  return (
    <Figure
      height={300}
      label="An action client on the left and an action server on the right, joined by five channels under the action's name: the send_goal service carries the goal and whether it was accepted; the feedback topic carries progress from server to client; the status topic carries every goal's state; the cancel_goal service asks the server to stop; and the get_result service returns the result when the goal is over."
      caption={
        <>
          An action is built from parts you already know: three services and two topics, hidden under{' '}
          <code>/drive_distance/_action/</code>. The client library ties them together, so your code sees one goal with
          callbacks for its acceptance, its feedback and its result.
        </>
      }
    >
      <rect x={10} y={20} width={130} height={260} rx={12} className="fig-box" />
      <text x={75} y={48} textAnchor="middle" className="fig-mono-strong">
        action client
      </text>
      <rect x={580} y={20} width={130} height={260} rx={12} className="fig-box-accent" />
      <text x={645} y={48} textAnchor="middle" className="fig-mono-strong">
        action server
      </text>
      {rows.map((r, i) => {
        const y = 82 + i * 44
        return (
          <g key={r.name}>
            {r.dir !== 'left' && <line x1={142} y1={y - 5} x2={576} y2={y - 5} className="fig-line-s1" markerEnd={arrow('s1')} />}
            {r.dir !== 'right' && <line x1={578} y1={y + 5} x2={144} y2={y + 5} className="fig-line-s2" markerEnd={arrow('s2')} />}
            <rect x={230} y={y - 14} width={140} height={28} rx={r.kind === 'topic' ? 7 : 14} className={r.kind === 'topic' ? 'topic-box' : 'fig-box'} />
            <text x={300} y={y + 4.5} textAnchor="middle" className="fig-mono">
              {r.name}
            </text>
            <text x={150} y={y - 12} className="fig-small">
              {r.kind}
            </text>
            <text x={380} y={y - 12} className="fig-small">
              {r.what}
            </text>
          </g>
        )
      })}
    </Figure>
  )
}
