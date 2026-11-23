// The source files Lesson 13 shows: the rover's bringup package, as the recordings ran it.

import stackLaunch from '../../../labs/lesson13/examples/rover_stack/launch/stack.launch.py?raw'
import stackYaml from '../../../labs/lesson13/examples/rover_stack/config/stack.yaml?raw'

const base = 'labs/lesson13/examples/rover_stack/'

export const code = {
  stackLaunch: { path: base + 'launch/stack.launch.py', code: stackLaunch },
  stackYaml: { path: base + 'config/stack.yaml', code: stackYaml },
}
