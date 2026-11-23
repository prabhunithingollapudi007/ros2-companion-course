// The two install locations Lesson 3's overlay example uses, read from its
// recordings so the playground cannot drift from what ROS really did.

import { lesson03 } from '../transcripts'
import type { Prefix } from './overlay'

/** "demo_nodes_py talker" lines → ["talker"] */
const programs = (output: string) =>
  output
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split(' ')[1])

export const UNDERLAY: Prefix[] = [
  { path: '/opt/ros/jazzy', packages: { demo_nodes_py: programs(lesson03.runs['under-executables'].output) } },
]

export const OVERLAY_WS = '/root/over'

export const OVERLAY_PACKAGES: Record<string, string[]> = {
  demo_nodes_py: programs(lesson03.runs['over-executables'].output),
}
