// The source files Lesson 10 shows: the counter's interface and node, as the recordings built and ran them.

import counterCmake from '../../../labs/lesson10/examples/counter_demo/CMakeLists.txt?raw'
import counter from '../../../labs/lesson10/examples/counter_demo/src/counter.cpp?raw'
import stepClient from '../../../labs/lesson10/examples/counter_demo/src/step_client.cpp?raw'
import interfacesCmake from '../../../labs/lesson10/examples/counter_interfaces/CMakeLists.txt?raw'
import interfacesXml from '../../../labs/lesson10/examples/counter_interfaces/package.xml?raw'
import setStep from '../../../labs/lesson10/examples/counter_interfaces/srv/SetStep.srv?raw'

const base = 'labs/lesson10/examples/'

export const code = {
  setStep: { path: base + 'counter_interfaces/srv/SetStep.srv', code: setStep },
  interfacesCmake: { path: base + 'counter_interfaces/CMakeLists.txt', code: interfacesCmake },
  interfacesXml: { path: base + 'counter_interfaces/package.xml', code: interfacesXml },
  counter: { path: base + 'counter_demo/src/counter.cpp', code: counter },
  stepClient: { path: base + 'counter_demo/src/step_client.cpp', code: stepClient },
  counterCmake: { path: base + 'counter_demo/CMakeLists.txt', code: counterCmake },
}
