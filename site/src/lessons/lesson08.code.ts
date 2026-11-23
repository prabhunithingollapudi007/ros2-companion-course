// The source files Lesson 8 shows: the frames_demo package and the lab's world,
// as the recordings built and ran them.

import labWorld from '../../../labs/lesson08/lab_world.py?raw'
import cmakeLists from '../../../labs/lesson08/examples/frames_demo/CMakeLists.txt?raw'
import roverWorld from '../../../labs/lesson08/examples/frames_demo/launch/rover_world.launch.py?raw'
import circleBroadcaster from '../../../labs/lesson08/examples/frames_demo/src/circle_broadcaster.cpp?raw'
import whereIs from '../../../labs/lesson08/examples/frames_demo/src/where_is.cpp?raw'

const base = 'labs/lesson08/examples/frames_demo/'

export const code = {
  circleBroadcaster: { path: base + 'src/circle_broadcaster.cpp', code: circleBroadcaster },
  whereIs: { path: base + 'src/where_is.cpp', code: whereIs },
  roverWorld: { path: base + 'launch/rover_world.launch.py', code: roverWorld },
  cmake: { path: base + 'CMakeLists.txt', code: cmakeLists },
  labWorld: { path: 'labs/lesson08/lab_world.py', code: labWorld },
}
