// The source files Lesson 6 shows: files in labs/lesson06 that the recordings run.

import makeWeatherBag from '../../../labs/lesson06/make_weather_bag.py?raw'
import syncCmake from '../../../labs/lesson06/examples/sync_demo/CMakeLists.txt?raw'
import pairPrinter from '../../../labs/lesson06/examples/sync_demo/src/pair_printer.cpp?raw'
import whatTime from '../../../labs/lesson06/examples/what_time.py?raw'

export const code = {
  pairPrinter: { path: 'labs/lesson06/examples/sync_demo/src/pair_printer.cpp', code: pairPrinter },
  syncCmake: { path: 'labs/lesson06/examples/sync_demo/CMakeLists.txt', code: syncCmake },
  whatTime: { path: 'labs/lesson06/examples/what_time.py', code: whatTime },
  makeWeatherBag: { path: 'labs/lesson06/make_weather_bag.py', code: makeWeatherBag },
}
