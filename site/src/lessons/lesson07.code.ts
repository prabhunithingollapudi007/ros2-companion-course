// The source files Lesson 7 shows: the rover package in labs/lesson07 that the recordings build and launch.

import cmakeLists from '../../../labs/lesson07/examples/rover_description/CMakeLists.txt?raw'
import viewLaunch from '../../../labs/lesson07/examples/rover_description/launch/view.launch.py?raw'
import roverXacro from '../../../labs/lesson07/examples/rover_description/urdf/rover.urdf.xacro?raw'

import { lineOf } from './lesson04.code'

const base = 'labs/lesson07/examples/rover_description/'

export const code = {
  rover: { path: base + 'urdf/rover.urdf.xacro', code: roverXacro },
  viewLaunch: { path: base + 'launch/view.launch.py', code: viewLaunch },
  cmake: { path: base + 'CMakeLists.txt', code: cmakeLists },
}

/** The lines of the rover file from the one containing `from` to the one containing `to`, for showing one part at a time. */
export const roverPart = (from: string, to: string): [number, number] => [lineOf(roverXacro, from), lineOf(roverXacro, to)]
