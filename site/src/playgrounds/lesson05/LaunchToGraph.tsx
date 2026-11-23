import { useState } from 'react'
import { Listing } from '../../components/Listing'
import { Playground } from '../../components/Playground'
import { Terminal } from '../../components/Terminal'
import { arrow } from '../../figures/arrows'
import { launchFiles } from '../../lessons/lesson05.code'
import { resolveNode } from '../../ros/names'
import { BUILT_IN_TOPICS, EXAMPLES, withArgs, type Example } from '../../ros/lesson05'
import '../playgrounds.css'

const ORDER = ['talk_listen', 'two_pairs', 'renamed', 'with_args', 'include']

/** One row per topic: who publishes, the topic, who subscribes. */
function rows(example: Example) {
  const resolved = example.nodes.map((n) => ({ ...resolveNode(n), role: n.role }))
  const topics = [...new Set(resolved.map((r) => r.topics[0]))].sort()
  return {
    resolved,
    topics: topics.map((t) => ({
      topic: t,
      pubs: resolved.filter((r) => r.role === 'pub' && r.topics[0] === t).map((r) => r.fullName),
      subs: resolved.filter((r) => r.role === 'sub' && r.topics[0] === t).map((r) => r.fullName),
    })),
  }
}

export function LaunchToGraph() {
  const [id, setId] = useState('talk_listen')
  const [robot, setRobot] = useState('robot1')
  const valid = /^[a-z][a-z0-9_]*$/.test(robot)
  const example = id === 'with_args' ? withArgs(valid ? robot : 'robot1') : EXAMPLES[id]
  const { resolved, topics } = rows(example)
  const height = 30 + topics.length * 70

  return (
    <Playground
      title="From launch file to graph"
      caption={
        <>
          Pick one of the example launch files. The graph and the lists are worked out from the file with the naming
          rules in this lesson; for each file, and for <code>robot:=rover</code>, they match what was recorded when it
          was launched in the course container.
        </>
      }
    >
      <div className="button-row">
        {ORDER.map((k) => (
          <button key={k} type="button" className={`btn btn-small ${k === id ? 'btn-primary' : 'btn-quiet'}`} aria-pressed={k === id} onClick={() => setId(k)}>
            {k}.launch.py
          </button>
        ))}
      </div>
      {id === 'with_args' && (
        <label className="select-field arg-field">
          <span className="slider-label">
            <code>robot:=</code>
          </span>
          <input value={robot} onChange={(e) => setRobot(e.target.value.trim())} spellCheck={false} aria-invalid={!valid} />
          {!valid && <span className="small dim">A namespace starts with a letter and uses lower-case letters, digits and _.</span>}
        </label>
      )}

      <Listing {...launchFiles[id]} />

      <div className="figure-scroll">
        <svg viewBox={`0 0 720 ${height}`} className="graph-svg" role="img" aria-label={topics.map((t) => `${t.pubs.join(' and ')} publish ${t.topic} to ${t.subs.join(' and ')}`).join('. ')}>
          {topics.map((t, i) => {
            const y = 40 + i * 70
            return (
              <g key={t.topic}>
                {t.pubs.map((p, k) => (
                  <g key={p}>
                    <ellipse cx={120} cy={y + k * 26} rx={100} ry={18} className="fig-node-accent" />
                    <text x={120} y={y + k * 26 + 4.5} textAnchor="middle" className="fig-mono">
                      {p}
                    </text>
                    <line x1={220} y1={y + k * 26} x2={276} y2={y} className="fig-line-s1" markerEnd={arrow('s1')} />
                  </g>
                ))}
                <rect x={278} y={y - 17} width={164} height={34} rx={8} className="topic-box" />
                <text x={360} y={y + 4.5} textAnchor="middle" className="fig-topic">
                  {t.topic}
                </text>
                {t.subs.map((s, k) => (
                  <g key={s}>
                    <line x1={442} y1={y} x2={498} y2={y + k * 26} className="fig-line-s1" markerEnd={arrow('s1')} />
                    <ellipse cx={600} cy={y + k * 26} rx={100} ry={18} className="fig-node" />
                    <text x={600} y={y + k * 26 + 4.5} textAnchor="middle" className="fig-mono">
                      {s}
                    </text>
                  </g>
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      <Terminal
        simulated
        title="What ros2 would list for this launch"
        run={[
          { command: 'ros2 node list', output: resolved.map((r) => r.fullName).sort().join('\n'), ended: 'exit' },
          { command: 'ros2 topic list', output: [...new Set([...topics.map((t) => t.topic), ...BUILT_IN_TOPICS])].sort().join('\n'), ended: 'exit' },
        ]}
      />
    </Playground>
  )
}
