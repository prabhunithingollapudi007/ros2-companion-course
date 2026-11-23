// The source files Lesson 4 shows. They are the files in labs/lesson04 that the
// recordings copy into a workspace and compile, imported as text.

import counterCpp from '../../../labs/lesson04/examples/greeter_cpp/src/counter.cpp?raw'
import greeterCpp from '../../../labs/lesson04/examples/greeter_cpp/src/greeter.cpp?raw'
import listenerCpp from '../../../labs/lesson04/examples/greeter_cpp/src/listener.cpp?raw'
import slowListenerCpp from '../../../labs/lesson04/examples/greeter_cpp/src/slow_listener.cpp?raw'
import cmakeLists from '../../../labs/lesson04/examples/greeter_cpp/CMakeLists.txt?raw'
import greetingMsg from '../../../labs/lesson04/examples/greeter_cpp/msg/Greeting.msg?raw'
import packageXml from '../../../labs/lesson04/examples/greeter_cpp/package.xml?raw'

const base = 'labs/lesson04/examples/greeter_cpp/'

export const code = {
  greeter: { path: base + 'src/greeter.cpp', code: greeterCpp },
  listener: { path: base + 'src/listener.cpp', code: listenerCpp },
  counter: { path: base + 'src/counter.cpp', code: counterCpp },
  slowListener: { path: base + 'src/slow_listener.cpp', code: slowListenerCpp },
  cmake: { path: base + 'CMakeLists.txt', code: cmakeLists },
  msg: { path: base + 'msg/Greeting.msg', code: greetingMsg },
  packageXml: { path: base + 'package.xml', code: packageXml },
}

/** The 1-based number of the first line containing `text`. Listings point at lines by content, so edits to a file cannot leave a highlight on the wrong line. */
export function lineOf(source: string, text: string): number {
  const i = source.split('\n').findIndex((line) => line.includes(text))
  if (i < 0) throw new Error(`No line containing "${text}"`)
  return i + 1
}
