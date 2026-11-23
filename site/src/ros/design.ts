// Lesson 13: choosing interfaces, and turning requirements into a graph of nodes.
// The graph's command chain is the one the lesson's launch files build:
// teleop -> speed_limiter -> cmd_watchdog -> Gazebo.

export type Interface = 'topic' | 'service' | 'action' | 'parameter'

export const CASES: { job: string; answer: Interface; why: string }[] = [
  { job: "A lidar's scans, ten times a second", answer: 'topic', why: 'A stream that several nodes may want, with nobody needing to reply.' },
  { job: "Switch the speed limiter to careful mode, and know that it did", answer: 'service', why: 'A quick request that needs an answer: did it work? (Lesson 10.)' },
  { job: 'Drive to the charging dock, 30 m away', answer: 'action', why: 'Long-running, with progress worth reporting and a need to call it off. (Lesson 11.)' },
  { job: "The robot's top speed, which differs between two robots", answer: 'parameter', why: 'A setting of one node, chosen at start and rarely changed. (Lesson 12.)' },
  { job: 'The battery level, for a dashboard and a planner', answer: 'topic', why: 'Data for whoever wants it, published as it is measured.' },
  { job: 'Save the map built so far to a file', answer: 'service', why: 'A command with a quick answer: the file was written, or why not.' },
  { job: 'Pick up a cup, with the arm reporting how far it has got', answer: 'action', why: 'Takes seconds, has feedback, and must be stoppable.' },
  { job: 'The frame a camera driver stamps its images with', answer: 'parameter', why: 'Configuration of the driver: it depends on how the robot is built, not on what happens.' },
  { job: 'Tell every node that the emergency stop was pressed', answer: 'topic', why: 'One event, many listeners; none of them should be able to hold up the others by being slow to answer.' },
  { job: 'Ask a node for its current estimate of a value, once, right now', answer: 'service', why: 'A question with an answer. If many nodes need it continually, publish it on a topic instead.' },
]

export type Requirement = 'teleop' | 'limit' | 'watchdog' | 'sim' | 'rviz' | 'goto'

export const REQUIREMENTS: { id: Requirement; text: string }[] = [
  { id: 'sim', text: 'Run it in simulation' },
  { id: 'teleop', text: 'Drive it from the keyboard' },
  { id: 'limit', text: 'Never faster than 0.8 m/s' },
  { id: 'watchdog', text: 'Stop when the commands stop' },
  { id: 'rviz', text: 'Watch it in RViz' },
  { id: 'goto', text: 'Drive to a point on request' },
]

export interface Edge {
  from: string
  to: string
  topic: string
  kind: 'topic' | 'action'
}

/** The nodes and connections a set of requirements needs. */
export function buildGraph(chosen: Requirement[]) {
  const has = (r: Requirement) => chosen.includes(r)
  const nodes: string[] = []
  const edges: Edge[] = []
  const sim = has('sim')
  if (sim) nodes.push('gazebo + bridge', 'robot_state_publisher')

  // The command chain, from whatever gives commands to whatever obeys them.
  const sources = [has('teleop') && 'teleop_twist_keyboard', has('goto') && 'go_to'].filter(Boolean) as string[]
  const stages = [has('limit') && 'speed_limiter', has('watchdog') && 'cmd_watchdog'].filter(Boolean) as string[]
  nodes.push(...sources, ...stages)
  const sink = sim ? 'gazebo + bridge' : null
  const chain = [...stages, ...(sink ? [sink] : [])]
  // Into the robot is always /cmd_vel; into the first stage /cmd_vel_in; between stages /cmd_vel_limited.
  if (chain.length) {
    for (const s of sources) edges.push({ from: s, to: chain[0], topic: chain[0] === sink ? '/cmd_vel' : '/cmd_vel_in', kind: 'topic' })
    for (let i = 1; i < chain.length; i++) {
      edges.push({ from: chain[i - 1], to: chain[i], topic: chain[i] === sink ? '/cmd_vel' : '/cmd_vel_limited', kind: 'topic' })
    }
  }
  if (has('goto')) {
    nodes.push('your client')
    edges.push({ from: 'your client', to: 'go_to', topic: '/go_to (action)', kind: 'action' })
    if (sim) edges.push({ from: 'gazebo + bridge', to: 'go_to', topic: '/odom', kind: 'topic' })
  }
  if (sim) edges.push({ from: 'gazebo + bridge', to: 'robot_state_publisher', topic: '/joint_states', kind: 'topic' })
  if (has('rviz')) {
    nodes.push('rviz2')
    if (sim) edges.push({ from: 'robot_state_publisher', to: 'rviz2', topic: '/tf, /robot_description', kind: 'topic' })
  }
  return { nodes, edges }
}
