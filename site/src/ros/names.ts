// How ROS 2 turns the names in a node's code into the names in the graph.
//
// A node has a name and a namespace. A topic name in the code is
//   absolute  "/chatter"  used as it is,
//   relative  "chatter"   put after the node's namespace: /robot1/chatter,
//   private   "~/chatter" put after the node's own full name: /robot1/talker/chatter.
// A remapping rule "from:=to" is applied first: both sides are expanded the same
// way, and a topic whose full name matches `from` is renamed to `to`.
// The special rules __node:= and __ns:= rename the node and move its namespace.
//
// names.test.ts checks this against Lesson 5's recordings.

export interface NodeSpec {
  /** The name the code gives the node: 'talker'. */
  name: string
  /** '' or 'robot1' or '/robot1'. */
  namespace?: string
  /** Topic names as written in the code. */
  topics: string[]
  /** Remapping rules, as in `-r from:=to` or a launch file's remappings. */
  remap?: [string, string][]
}

/** '/robot1', or '' for the root namespace. */
export function normaliseNamespace(ns: string | undefined): string {
  if (!ns || ns === '/') return ''
  return '/' + ns.replace(/^\/+|\/+$/g, '')
}

/** Expands a name the way ROS does, for a node with this namespace and full name. */
export function expand(name: string, namespace: string, nodeFullName: string): string {
  if (name.startsWith('/')) return name
  if (name.startsWith('~')) return nodeFullName + name.slice(1)
  return `${namespace}/${name}`
}

export interface ResolvedNode {
  /** /robot1/talker */
  fullName: string
  /** Topic names after remapping and expansion, in the order written. */
  topics: string[]
}

export function resolveNode(spec: NodeSpec): ResolvedNode {
  let name = spec.name
  let namespace = normaliseNamespace(spec.namespace)
  const rules: [string, string][] = []
  for (const [from, to] of spec.remap ?? []) {
    if (from === '__node') name = to
    else if (from === '__ns') namespace = normaliseNamespace(to)
    else rules.push([from, to])
  }
  const fullName = `${namespace}/${name}`
  const topics = spec.topics.map((written) => {
    const full = expand(written, namespace, fullName)
    for (const [from, to] of rules) {
      if (expand(from, namespace, fullName) === full) return expand(to, namespace, fullName)
    }
    return full
  })
  return { fullName, topics }
}

/** What `ros2 node list` and `ros2 topic list` would print for these nodes (without the topics every node has). */
export function graphNames(specs: NodeSpec[]): { nodes: string[]; topics: string[] } {
  const resolved = specs.map(resolveNode)
  return {
    nodes: resolved.map((r) => r.fullName).sort(),
    topics: [...new Set(resolved.flatMap((r) => r.topics))].sort(),
  }
}
