import { describe, expect, it } from 'vitest'
import { lesson03 } from '../transcripts'
import { lesson03Lab } from './lesson03.lab'

// Each statement Lesson03.mdx makes, checked against what the commands printed
// in the course container, and every lab answer against the same recordings.

const out = (id: string) => lesson03.runs[id].output
const lines = (id: string) => out(id).split('\n')

describe('what Lesson 3 says, against the recordings', () => {
  it('a new workspace is a folder with src in it', () => {
    expect(lines('tree-empty')).toEqual(['.', './src'])
  })

  it('ros2 pkg create writes package.xml, CMakeLists.txt, a licence and empty code folders', () => {
    for (const p of ['./src/my_robot/package.xml', './src/my_robot/CMakeLists.txt', './src/my_robot/LICENSE', './src/my_robot/src', './src/my_robot/include/my_robot']) {
      expect(lines('tree-src')).toContain(p)
    }
    expect(out('package-xml')).toContain('<build_type>ament_cmake</build_type>')
    expect(out('colcon-list')).toMatch(/^my_robot\tsrc\/my_robot\t\(ros\.ament_cmake\)$/)
  })

  it('colcon build creates build, install and log next to src, and install has the setup files', () => {
    expect(out('build')).toMatch(/Summary: 1 package finished/)
    expect(lines('ls-after')).toEqual(['build', 'install', 'log', 'src'])
    expect(lines('tree-install')).toContain('install/setup.bash')
    expect(lines('tree-install')).toContain('install/my_robot')
  })

  it('the package is found only after sourcing, and the workspace comes before Jazzy', () => {
    expect(out('prefix-before')).toBe('Package not found')
    expect(out('prefix-after')).toBe('/root/ws/install/my_robot')
    expect(out('ament-after')).toBe('/root/ws/install/my_robot:/opt/ros/jazzy')
  })

  it('deleting build, install and log leaves src; running colcon inside src builds in there', () => {
    expect(out('clean')).toBe('src')
    expect(lines('wrong-dir-ls')).toEqual(['build', 'install', 'log', 'my_robot'])
  })

  it('--node-name adds a program that prints a greeting, and --dependencies adds a depend tag', () => {
    expect(out('node-cpp')).toContain('printf("hello world hello_ros package\\n");')
    expect(out('node-deps')).toContain('<depend>rclcpp</depend>')
    expect(out('node-cmake')).toContain('add_executable(hello src/hello.cpp)')
    expect(out('run-node')).toBe('hello world hello_ros package')
    expect(out('select-build')).toMatch(/Summary: 1 package finished/)
  })

  it('an undeclared std_msgs fails to compile, and declaring it in both files fixes it', () => {
    expect(out('broken-include')).toContain('#include "std_msgs/msg/string.hpp"')
    expect(out('build-broken')).toContain('fatal error: std_msgs/msg/string.hpp: No such file or directory')
    expect(out('build-broken')).toContain('1 package failed: greeter')
    expect(out('fixed-deps')).toMatch(/^package\.xml:\d+:\s+<depend>std_msgs<\/depend>$/m)
    expect(out('fixed-deps')).toMatch(/^CMakeLists\.txt:\d+:find_package\(std_msgs REQUIRED\)$/m)
    expect(out('build-fixed')).toMatch(/Summary: 1 package finished/)
  })
})

describe('the Lesson 3 lab answers come from the recordings', () => {
  it('the checker fails before the build and passes on the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/6 of 8 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 8 checks passed\.$/)
  })

  it('each recorded answer is accepted and near misses are refused', () => {
    const right = [out('lab-ls').split('\n').join(' '), out('lab-prefix'), out('lab-run-stale'), '8']
    const wrong = ['build install', '/root/ws/install/hello_ros', out('lab-run-new'), '6']
    lesson03Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })

  it('a stale program keeps the old greeting until the rebuild', () => {
    expect(out('lab-run-first')).toBe('hello world hello_ros package')
    expect(out('lab-edited')).toContain('Hello from my first package')
    expect(out('lab-run-stale')).toBe('hello world hello_ros package')
    expect(out('lab-run-new')).toBe('Hello from my first package')
  })
})
