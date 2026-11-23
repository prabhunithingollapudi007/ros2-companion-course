// What happens to the rest of a robot's software when one piece stops.
//
// Each node is either a source, which publishes on its own (a driver reading a
// sensor), or reacts to what it receives and publishes a result. A node that
// stops takes nothing else down with it: the others keep running, and the ones
// downstream simply stop receiving. That is the behaviour recorded in Lesson 1
// with the demo talker and listener; dataflow.test.ts checks the model against it.
//
// The alternative it is compared with is one big program, where a crash in any
// part ends the whole process.

export interface FlowNode {
  name: string
  /** Topics it subscribes to. */
  inputs: string[]
  /** Topics it publishes. */
  outputs: string[]
  /** Publishes on its own, without needing input. */
  source?: boolean
}

export type NodeState = 'running' | 'waiting' | 'stopped'

export interface FlowResult {
  /** running: receiving input (or a source) and publishing; waiting: alive, but nothing arrives; stopped: not running. */
  state: Record<string, NodeState>
  /** Topics on which messages are flowing. */
  live: Set<string>
}

/**
 * `stopped` names the nodes that have been stopped. With `monolith` set, every
 * node is part of one process, so stopping any of them stops all of them.
 */
export function flow(nodes: FlowNode[], stopped: Set<string>, monolith = false): FlowResult {
  const down = monolith && stopped.size > 0 ? new Set(nodes.map((n) => n.name)) : stopped
  const live = new Set<string>()
  const active = new Set<string>()
  // Propagate from the sources until nothing changes. A node is active if it is
  // up and is either a source or receives at least one live topic.
  let changed = true
  while (changed) {
    changed = false
    for (const n of nodes) {
      if (down.has(n.name) || active.has(n.name)) continue
      if (n.source || n.inputs.some((t) => live.has(t))) {
        active.add(n.name)
        for (const t of n.outputs) live.add(t)
        changed = true
      }
    }
  }
  const state: Record<string, NodeState> = {}
  for (const n of nodes) state[n.name] = down.has(n.name) ? 'stopped' : active.has(n.name) ? 'running' : 'waiting'
  return { state, live }
}

/** The line-following robot from Lesson 2's first figure. */
export const LINE_FOLLOWER: FlowNode[] = [
  { name: 'camera_driver', inputs: [], outputs: ['/image'], source: true },
  { name: 'line_detector', inputs: ['/image'], outputs: ['/line_offset'] },
  { name: 'recorder', inputs: ['/image'], outputs: [] },
  { name: 'steering', inputs: ['/line_offset'], outputs: ['/cmd_vel'] },
  { name: 'motor_driver', inputs: ['/cmd_vel'], outputs: [] },
]

/** The two demo nodes. */
export const TALKER_LISTENER: FlowNode[] = [
  { name: 'talker', inputs: [], outputs: ['/chatter'], source: true },
  { name: 'listener', inputs: ['/chatter'], outputs: [] },
]
