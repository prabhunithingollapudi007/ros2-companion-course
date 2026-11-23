// The source files Lesson 11 shows: the drive action and its server and client,
// as the recordings built and ran them.

import driveDistance from '../../../labs/lesson11/examples/drive_interfaces/action/DriveDistance.action?raw'
import demoCmake from '../../../labs/lesson11/examples/drive_demo/CMakeLists.txt?raw'
import driveClient from '../../../labs/lesson11/examples/drive_demo/src/drive_client.cpp?raw'
import driveServer from '../../../labs/lesson11/examples/drive_demo/src/drive_server.cpp?raw'

const base = 'labs/lesson11/examples/'

export const code = {
  driveDistance: { path: base + 'drive_interfaces/action/DriveDistance.action', code: driveDistance },
  driveServer: { path: base + 'drive_demo/src/drive_server.cpp', code: driveServer },
  driveClient: { path: base + 'drive_demo/src/drive_client.cpp', code: driveClient },
  demoCmake: { path: base + 'drive_demo/CMakeLists.txt', code: demoCmake },
}
