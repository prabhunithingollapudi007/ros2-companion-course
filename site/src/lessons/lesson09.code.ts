// The source files Lesson 9 shows: the rover_sim package the recordings build and run.

import simLaunch from '../../../labs/lesson09/examples/rover_sim/launch/sim.launch.py?raw'
import roverSim from '../../../labs/lesson09/examples/rover_sim/urdf/rover_sim.urdf.xacro?raw'
import arena from '../../../labs/lesson09/examples/rover_sim/worlds/arena.sdf?raw'

const base = 'labs/lesson09/examples/rover_sim/'

export const code = {
  arena: { path: base + 'worlds/arena.sdf', code: arena },
  roverSim: { path: base + 'urdf/rover_sim.urdf.xacro', code: roverSim },
  simLaunch: { path: base + 'launch/sim.launch.py', code: simLaunch },
}
