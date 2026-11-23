// The launch files Lesson 5 shows: the files in labs/lesson05 that the
// recordings build, install and launch, imported as text.

import cmakeLists from '../../../labs/lesson05/examples/launch_demo/CMakeLists.txt?raw'
import include from '../../../labs/lesson05/examples/launch_demo/launch/include.launch.py?raw'
import renamed from '../../../labs/lesson05/examples/launch_demo/launch/renamed.launch.py?raw'
import talkListen from '../../../labs/lesson05/examples/launch_demo/launch/talk_listen.launch.py?raw'
import twoPairs from '../../../labs/lesson05/examples/launch_demo/launch/two_pairs.launch.py?raw'
import withArgs from '../../../labs/lesson05/examples/launch_demo/launch/with_args.launch.py?raw'

const base = 'labs/lesson05/examples/launch_demo/'

export const launchFiles: Record<string, { path: string; code: string }> = {
  talk_listen: { path: base + 'launch/talk_listen.launch.py', code: talkListen },
  two_pairs: { path: base + 'launch/two_pairs.launch.py', code: twoPairs },
  renamed: { path: base + 'launch/renamed.launch.py', code: renamed },
  with_args: { path: base + 'launch/with_args.launch.py', code: withArgs },
  include: { path: base + 'launch/include.launch.py', code: include },
}

export const cmake = { path: base + 'CMakeLists.txt', code: cmakeLists }
