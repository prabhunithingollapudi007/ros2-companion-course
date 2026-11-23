// A deliberately small model of the ROS graph: nodes, the topics they publish
// and subscribe to, and which of them connect. It is what the playgrounds draw,
// and it prints what the `ros2` command would print for the same graph.
//
// graph.test.ts holds it to the real thing: for each situation that was recorded
// in the course container, the model must give the recorded answer.

export interface GraphNode {
  /** Without the leading slash: 'talker'. */
  name: string
  /** The ROS_DOMAIN_ID it was started with. */
  domain: number
  /** Command-line tools such as `ros2 topic echo` join the graph as hidden nodes. */
  hidden?: boolean
}

export interface Endpoint {
  node: string
  /** With the leading slash: '/chatter'. */
  topic: string
  /** 'std_msgs/msg/String' */
  type: string
}

export interface Graph {
  nodes: GraphNode[]
  publishers: Endpoint[]
  subscriptions: Endpoint[]
}

export interface Connection {
  publisher: Endpoint
  subscription: Endpoint
}

/** Every node publishes to these two, and the `ros2` command's own helper keeps them alive in an empty graph. */
export const ALWAYS_THERE: { topic: string; type: string }[] = [
  { topic: '/parameter_events', type: 'rcl_interfaces/msg/ParameterEvent' },
  { topic: '/rosout', type: 'rcl_interfaces/msg/Log' },
]

const domainOf = (graph: Graph, node: string): number => {
  const found = graph.nodes.find((n) => n.name === node)
  if (!found) throw new Error(`No node named ${node}`)
  return found.domain
}

const inDomain = (graph: Graph, domain: number) => (e: Endpoint) => domainOf(graph, e.node) === domain

/**
 * A publisher and a subscription connect when they are in the same domain and
 * agree on both the topic name and the message type. (Quality of service must
 * also be compatible; that is Lesson 14, and this model assumes it is.)
 */
export function connections(graph: Graph): Connection[] {
  const out: Connection[] = []
  for (const publisher of graph.publishers) {
    for (const subscription of graph.subscriptions) {
      if (
        publisher.topic === subscription.topic &&
        publisher.type === subscription.type &&
        domainOf(graph, publisher.node) === domainOf(graph, subscription.node)
      ) {
        out.push({ publisher, subscription })
      }
    }
  }
  return out
}

/** The subscriptions that get a copy of each message this publisher sends. */
export function receivers(graph: Graph, publisher: Endpoint): Endpoint[] {
  return connections(graph)
    .filter((c) => c.publisher === publisher)
    .map((c) => c.subscription)
}

/** What `ros2 node list` prints from a terminal in the given domain. */
export function nodeList(graph: Graph, domain: number): string[] {
  return graph.nodes
    .filter((n) => n.domain === domain && !n.hidden)
    .map((n) => `/${n.name}`)
    .sort()
}

export interface TopicInfo {
  topic: string
  types: string[]
  publishers: number
  subscriptions: number
}

/** What `ros2 topic info` reports for one topic, seen from the given domain. */
export function topicInfo(graph: Graph, domain: number, topic: string): TopicInfo {
  const publishers = graph.publishers.filter(inDomain(graph, domain)).filter((e) => e.topic === topic)
  const subscriptions = graph.subscriptions.filter(inDomain(graph, domain)).filter((e) => e.topic === topic)
  const types = [...new Set([...publishers, ...subscriptions].map((e) => e.type))].sort()
  return { topic, types, publishers: publishers.length, subscriptions: subscriptions.length }
}

/** The topics `ros2 topic list -t` shows from the given domain, in the order it shows them. */
export function topicList(graph: Graph, domain: number): { topic: string; types: string[] }[] {
  const seen = [...graph.publishers, ...graph.subscriptions].filter(inDomain(graph, domain)).map((e) => e.topic)
  const own = [...new Set(seen)].map((topic) => ({ topic, types: topicInfo(graph, domain, topic).types }))
  const always = ALWAYS_THERE.filter((a) => !seen.includes(a.topic)).map((a) => ({ topic: a.topic, types: [a.type] }))
  return [...own, ...always].sort((a, b) => (a.topic < b.topic ? -1 : 1))
}

/** The text of `ros2 topic list -t`. */
export function formatTopicList(list: { topic: string; types: string[] }[]): string {
  return list.map((t) => `${t.topic} [${t.types.join(', ')}]`).join('\n')
}

/** The text of `ros2 topic info`. */
export function formatTopicInfo(info: TopicInfo): string {
  const type = info.types.length === 1 ? info.types[0] : `[${info.types.map((t) => `'${t}'`).join(', ')}]`
  return `Type: ${type}\nPublisher count: ${info.publishers}\nSubscription count: ${info.subscriptions}`
}

// ---- Small builders, so the playgrounds and the tests describe graphs the same way ----

export const STRING = 'std_msgs/msg/String'
export const INT32 = 'std_msgs/msg/Int32'

export function emptyGraph(): Graph {
  return { nodes: [], publishers: [], subscriptions: [] }
}

/** Adds a node that publishes to one topic. Returns a new graph. */
export function withPublisher(graph: Graph, name: string, topic: string, type: string, domain = 0): Graph {
  return {
    nodes: [...graph.nodes, { name, domain }],
    publishers: [...graph.publishers, { node: name, topic, type }],
    subscriptions: graph.subscriptions,
  }
}

/** Adds a node that subscribes to one topic. Returns a new graph. */
export function withSubscriber(graph: Graph, name: string, topic: string, type: string, domain = 0, hidden = false): Graph {
  return {
    nodes: [...graph.nodes, { name, domain, ...(hidden ? { hidden } : {}) }],
    publishers: graph.publishers,
    subscriptions: [...graph.subscriptions, { node: name, topic, type }],
  }
}
