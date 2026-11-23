import { useMemo, useState } from 'react'
import { Playground, Stat } from '../../components/Playground'
import { Terminal } from '../../components/Terminal'
import {
  INT32,
  STRING,
  connections,
  emptyGraph,
  formatTopicInfo,
  formatTopicList,
  topicInfo,
  topicList,
  withPublisher,
  withSubscriber,
  type Endpoint,
  type Graph,
} from '../../ros/graph'
import '../playgrounds.css'

type Role = 'pub' | 'sub'

interface Row {
  id: number
  role: Role
  topic: string
  type: string
}

const TOPICS = ['/chatter', '/chatter2']
const TYPES = [STRING, INT32]
const MAX_PER_SIDE = 3
const short = (type: string) => type.split('/').pop()

const START: Row[] = [
  { id: 1, role: 'pub', topic: '/chatter', type: STRING },
  { id: 2, role: 'sub', topic: '/chatter', type: STRING },
]

/** Names like the demo nodes: talker, talker_2, listener, listener_2. */
function named(rows: Row[]): (Row & { name: string })[] {
  const count = { pub: 0, sub: 0 }
  return rows.map((r) => {
    count[r.role] += 1
    const base = r.role === 'pub' ? 'talker' : 'listener'
    return { ...r, name: count[r.role] === 1 ? base : `${base}_${count[r.role]}` }
  })
}

function toGraph(rows: (Row & { name: string })[]): Graph {
  let g = emptyGraph()
  for (const r of rows) g = r.role === 'pub' ? withPublisher(g, r.name, r.topic, r.type) : withSubscriber(g, r.name, r.topic, r.type)
  return g
}

// Layout: publishers on the left, one box per topic name in the middle, subscribers on the right.
const W = 720
const PUB_X = 100
const TOPIC_X = 360
const SUB_X = 620
const ROW_H = 76
const TOP = 48

export function LiveGraph() {
  const [rows, setRows] = useState<Row[]>(START)
  const [nextId, setNextId] = useState(3)

  const view = useMemo(() => {
    const nodes = named(rows)
    const graph = toGraph(nodes)
    const links = connections(graph)
    const pubs = nodes.filter((n) => n.role === 'pub')
    const subs = nodes.filter((n) => n.role === 'sub')
    const topics = TOPICS.filter((t) => nodes.some((n) => n.topic === t))
    const rowsTall = Math.max(pubs.length, subs.length, topics.length, 1)
    const height = TOP + rowsTall * ROW_H + 8
    const yOf = (i: number, count: number) => TOP + ((rowsTall - count) * ROW_H) / 2 + i * ROW_H + ROW_H / 2 - 18
    const pos = new Map<string, { x: number; y: number }>()
    pubs.forEach((n, i) => pos.set(n.name, { x: PUB_X, y: yOf(i, pubs.length) }))
    subs.forEach((n, i) => pos.set(n.name, { x: SUB_X, y: yOf(i, subs.length) }))
    const topicPos = new Map(topics.map((t, i) => [t, { x: TOPIC_X, y: yOf(i, topics.length) }]))
    const connected = (e: Endpoint, role: Role) =>
      links.some((l) => (role === 'pub' ? l.publisher : l.subscription) === e)
    return { nodes, graph, links, topics, height, pos, topicPos, connected }
  }, [rows])

  const update = (id: number, change: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...change } : r)))
  const add = (role: Role) => {
    setRows((rs) => [...rs, { id: nextId, role, topic: '/chatter', type: STRING }])
    setNextId((n) => n + 1)
  }
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id))
  const countOf = (role: Role) => rows.filter((r) => r.role === role).length

  const { graph, links, topics, height, pos, topicPos, connected } = view
  const endpointOf = (name: string, role: Role) =>
    (role === 'pub' ? graph.publishers : graph.subscriptions).find((e) => e.node === name)!

  return (
    <Playground
      title="A live graph"
      caption={
        <>
          Each moving dot is one message. A publisher sends one copy to every subscription it is connected to, and a
          publisher and a subscription connect only when they use the same topic name and the same message type. The
          terminal underneath is computed from this graph; its format, and what it says for each situation, were checked
          against the real commands in the course container.
        </>
      }
    >
      <div className="graph-editor">
        {(['pub', 'sub'] as const).map((role) => (
          <div className="graph-editor-col" key={role}>
            <div className="chart-title">{role === 'pub' ? 'Publishers' : 'Subscribers'}</div>
            {view.nodes
              .filter((n) => n.role === role)
              .map((n) => (
                <div className="graph-editor-row" key={n.id}>
                  <code className="graph-editor-name">/{n.name}</code>
                  <select aria-label={`Topic of /${n.name}`} value={n.topic} onChange={(e) => update(n.id, { topic: e.target.value })}>
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <select aria-label={`Message type of /${n.name}`} value={n.type} onChange={(e) => update(n.id, { type: e.target.value })}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {short(t)}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-quiet btn-small" onClick={() => remove(n.id)} aria-label={`Stop /${n.name}`}>
                    Stop
                  </button>
                </div>
              ))}
            <button type="button" className="btn btn-small" onClick={() => add(role)} disabled={countOf(role) >= MAX_PER_SIDE}>
              {role === 'pub' ? 'Start a publisher' : 'Start a subscriber'}
            </button>
          </div>
        ))}
      </div>

      <div className="figure-scroll">
        <svg viewBox={`0 0 ${W} ${height}`} className="graph-svg" role="img" aria-label={`${rows.length} nodes and ${links.length} connections.`}>
          <text x={PUB_X} y={22} textAnchor="middle" className="fig-label">
            Publishers
          </text>
          <text x={TOPIC_X} y={22} textAnchor="middle" className="fig-label">
            Topics
          </text>
          <text x={SUB_X} y={22} textAnchor="middle" className="fig-label">
            Subscribers
          </text>

          {/* Edges from each node to its topic, solid if they carry messages. */}
          {view.nodes.map((n) => {
            const p = pos.get(n.name)!
            const t = topicPos.get(n.topic)!
            const live = connected(endpointOf(n.name, n.role), n.role)
            const [x1, x2] = n.role === 'pub' ? [p.x + 74, t.x - 82] : [t.x + 82, p.x - 74]
            const [y1, y2] = n.role === 'pub' ? [p.y, t.y] : [t.y, p.y]
            return (
              <g key={`edge-${n.id}`}>
                <path d={`M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`} className={live ? 'edge-live' : 'edge-dead'} />
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 7} textAnchor="middle" className={`edge-type ${live ? '' : 'is-dead'}`}>
                  {short(n.type)}
                </text>
              </g>
            )
          })}

          {/* One dot per connection, travelling publisher → topic → subscriber. */}
          {links.map((l, i) => {
            const a = pos.get(l.publisher.node)!
            const b = pos.get(l.subscription.node)!
            const t = topicPos.get(l.publisher.topic)!
            const route = `M${a.x + 74},${a.y} C${(a.x + t.x) / 2 + 10},${a.y} ${(a.x + t.x) / 2},${t.y} ${t.x - 82},${t.y} H${t.x + 82} C${(t.x + b.x) / 2},${t.y} ${(t.x + b.x) / 2 - 10},${b.y} ${b.x - 74},${b.y}`
            return (
              <circle key={`msg-${l.publisher.node}-${l.subscription.node}`} r={5} className="msg-dot">
                <animateMotion dur="1.6s" begin={`${(i * 0.23) % 1.6}s`} repeatCount="indefinite" path={route} />
              </circle>
            )
          })}

          {topics.map((topic) => {
            const t = topicPos.get(topic)!
            const info = topicInfo(graph, 0, topic)
            const mixed = info.types.length > 1
            return (
              <g key={topic}>
                <rect x={t.x - 82} y={t.y - 20} width={164} height={40} rx={8} className={mixed ? 'topic-box is-mixed' : 'topic-box'} />
                <text x={t.x} y={t.y + 4.5} textAnchor="middle" className="fig-topic">
                  {topic}
                </text>
                {mixed && (
                  <text x={t.x} y={t.y + 36} textAnchor="middle" className="topic-warning">
                    two types on one topic
                  </text>
                )}
              </g>
            )
          })}

          {view.nodes.map((n) => {
            const p = pos.get(n.name)!
            const live = connected(endpointOf(n.name, n.role), n.role)
            return (
              <g key={`node-${n.id}`}>
                <ellipse cx={p.x} cy={p.y} rx={74} ry={21} className={live ? 'fig-node-accent' : 'fig-node'} />
                <text x={p.x} y={p.y + 4.5} textAnchor="middle" className="fig-mono">
                  /{n.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="stats">
        <Stat label="Nodes" value={rows.length} />
        <Stat label="Connections" value={links.length} note="publisher–subscription pairs that exchange messages" />
        <Stat
          label="Subscriptions hearing nothing"
          value={graph.subscriptions.filter((s) => !connected(s, 'sub')).length}
          note="wrong name, wrong type, or no publisher"
        />
      </div>

      <Terminal
        simulated
        title="What the ros2 command would print for this graph"
        run={[
          { command: 'ros2 topic list -t', output: formatTopicList(topicList(graph, 0)), ended: 'exit' },
          ...topics.map((topic) => ({ command: `ros2 topic info ${topic}`, output: formatTopicInfo(topicInfo(graph, 0, topic)), ended: 'exit' as const })),
        ]}
      />
    </Playground>
  )
}
