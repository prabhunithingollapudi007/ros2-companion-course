import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { expand, normaliseNamespace, resolveNode } from '../../ros/names'
import '../playgrounds.css'

const NAMESPACES = ['', 'robot1']
const WRITTEN = ['chatter', '/chatter', '~/chatter']
const RULES: { label: string; rule: [string, string] | null }[] = [
  { label: 'no rule', rule: null },
  { label: 'chatter:=news', rule: ['chatter', 'news'] },
  { label: 'chatter:=/news', rule: ['chatter', '/news'] },
  { label: '__node:=speaker', rule: ['__node', 'speaker'] },
  { label: '__ns:=/robot2', rule: ['__ns', '/robot2'] },
]

export function NameResolver() {
  const [ns, setNs] = useState('')
  const [written, setWritten] = useState('chatter')
  const [ruleIndex, setRuleIndex] = useState(0)

  const rule = RULES[ruleIndex].rule
  const resolved = resolveNode({ name: 'talker', namespace: ns, topics: [written], remap: rule ? [rule] : [] })
  const namespace = rule?.[0] === '__ns' ? normaliseNamespace(rule[1]) : normaliseNamespace(ns)
  const expanded = expand(written, namespace, resolved.fullName)
  const renamed = rule && !rule[0].startsWith('__') && expanded !== resolved.topics[0]

  const args = [ns ? `-r __ns:=/${ns}` : '', rule ? `-r ${rule[0]}:=${rule[1]}` : ''].filter(Boolean).join(' ')

  return (
    <Playground
      title="Where does a name end up?"
      caption={
        <>
          A node called <code>talker</code> publishes on a topic whose name is written in its code. Choose the
          namespace it is started in, how the topic name is written, and one remapping rule. The model follows the
          naming rules in the ROS 2 design articles; for the four talkers started from the command line above, it gives
          the names that were recorded.
        </>
      }
    >
      <div className="controls controls-3">
        <label className="select-field">
          <span className="slider-label">Namespace it is started in</span>
          <select value={ns} onChange={(e) => setNs(e.target.value)}>
            {NAMESPACES.map((n) => (
              <option key={n} value={n}>
                {n ? `/${n}` : '/ (none)'}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="slider-label">Topic name as written in the code</span>
          <select value={written} onChange={(e) => setWritten(e.target.value)}>
            {WRITTEN.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="slider-label">Remapping rule</span>
          <select value={ruleIndex} onChange={(e) => setRuleIndex(Number(e.target.value))}>
            {RULES.map((r, i) => (
              <option key={r.label} value={i}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ol className="resolve-steps">
        <li>
          The node&apos;s full name is <code>{resolved.fullName}</code>
          {rule?.[0] === '__node' && <> (renamed by the rule)</>}
          {rule?.[0] === '__ns' && <> (moved by the rule)</>}.
        </li>
        <li>
          <code>{written}</code> is{' '}
          {written.startsWith('/') ? 'absolute, so it is used as it is' : written.startsWith('~') ? "private, so it goes after the node's full name" : "relative, so it goes after the node's namespace"}
          : <code>{expanded}</code>.
        </li>
        <li>
          {rule && !rule[0].startsWith('__') ? (
            renamed ? (
              <>
                The rule matches <code>{expand(rule[0], namespace, resolved.fullName)}</code>, so the topic becomes{' '}
                <code>{resolved.topics[0]}</code>.
              </>
            ) : (
              <>
                The rule&apos;s <code>{rule[0]}</code> expands to <code>{expand(rule[0], namespace, resolved.fullName)}</code>,
                which is not this topic, so it does not apply.
              </>
            )
          ) : (
            <>No topic rule applies.</>
          )}
        </li>
      </ol>
      <div className="cards">
        <div className="card">
          <div className="card-title">ros2 node list shows</div>
          <div className="card-value mono">{resolved.fullName}</div>
        </div>
        <div className="card">
          <div className="card-title">ros2 topic list shows</div>
          <div className="card-value mono">{resolved.topics[0]}</div>
        </div>
      </div>
      <p className="small dim">
        From the command line: <code>ros2 run demo_nodes_cpp talker{args ? ` --ros-args ${args}` : ''}</code>
      </p>
    </Playground>
  )
}
