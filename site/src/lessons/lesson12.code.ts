// The source files Lesson 12 shows: the blinker, its YAML file and its launch file,
// as the recordings built and ran them.

import blinker from '../../../labs/lesson12/examples/params_demo/src/blinker.cpp?raw'
import porchLaunch from '../../../labs/lesson12/examples/params_demo/launch/porch.launch.py?raw'
import porchYaml from '../../../labs/lesson12/examples/params_demo/config/porch.yaml?raw'

const base = 'labs/lesson12/examples/params_demo/'

export const code = {
  blinker: { path: base + 'src/blinker.cpp', code: blinker },
  porchYaml: { path: base + 'config/porch.yaml', code: porchYaml },
  porchLaunch: { path: base + 'launch/porch.launch.py', code: porchLaunch },
}
