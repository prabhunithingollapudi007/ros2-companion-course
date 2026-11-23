// Lesson 5's examples described for the name model in names.ts. Each mirrors a
// launch file or a command in labs/lesson05/examples; names.test.ts checks that
// the model gives the node and topic names that were recorded for it.

import type { NodeSpec } from './names'

export interface Example {
  id: string
  label: string
  /** The nodes it starts, each with whether it publishes or subscribes on its one topic. */
  nodes: (NodeSpec & { role: 'pub' | 'sub' })[]
}

const talker = (extra: Partial<NodeSpec> = {}): Example['nodes'][number] => ({ name: 'talker', topics: ['chatter'], role: 'pub', ...extra })
const listener = (extra: Partial<NodeSpec> = {}): Example['nodes'][number] => ({ name: 'listener', topics: ['chatter'], role: 'sub', ...extra })

export const EXAMPLES: Record<string, Example> = {
  talk_listen: { id: 'talk_listen', label: 'talk_listen.launch.py', nodes: [talker(), listener()] },
  two_pairs: {
    id: 'two_pairs',
    label: 'two_pairs.launch.py',
    nodes: [talker({ namespace: 'left' }), listener({ namespace: 'left' }), talker({ namespace: 'right' }), listener({ namespace: 'right' })],
  },
  renamed: {
    id: 'renamed',
    label: 'renamed.launch.py',
    nodes: [
      talker({ remap: [['__node', 'speaker'], ['chatter', 'announcements']] }),
      listener({ remap: [['__node', 'audience'], ['chatter', 'announcements']] }),
    ],
  },
  include: { id: 'include', label: 'include.launch.py', nodes: [talker({ namespace: 'base' }), listener({ namespace: 'base' })] },
}

/** with_args.launch.py, for a given value of its robot argument. */
export const withArgs = (robot: string): Example => ({
  id: 'with_args',
  label: 'with_args.launch.py',
  nodes: [talker({ namespace: robot }), listener({ namespace: robot })],
})

/** The four talkers started from the command line in the recording. */
export const CLI_TALKERS: NodeSpec[] = [
  { name: 'talker', topics: ['chatter'], remap: [['__node', 'speaker']] },
  { name: 'talker', topics: ['chatter'], remap: [['__ns', '/robot1']] },
  { name: 'talker', topics: ['chatter'], remap: [['__ns', '/robot2'], ['chatter', 'news']] },
  { name: 'talker', topics: ['chatter'], remap: [['__ns', '/robot3'], ['chatter', '/news']] },
]

/** The topics every node has, which `ros2 topic list` always shows. */
export const BUILT_IN_TOPICS = ['/parameter_events', '/rosout']
