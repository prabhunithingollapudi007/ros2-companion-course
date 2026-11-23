import { describe, expect, it } from 'vitest'
import { lesson03 } from '../transcripts'
import { OVERLAY_PACKAGES, OVERLAY_WS, UNDERLAY } from './lesson03'
import { amentPrefixPath, executables, findPackage, overlay } from './overlay'

const out = (id: string) => lesson03.runs[id].output
const both = overlay(UNDERLAY, OVERLAY_WS, OVERLAY_PACKAGES)

describe('the overlay model agrees with the recordings', () => {
  it('with only Jazzy sourced, demo_nodes_py comes from /opt/ros/jazzy with all its programs', () => {
    expect(findPackage(UNDERLAY, 'demo_nodes_py')!.path).toBe(out('under-prefix'))
    expect(executables(UNDERLAY, 'demo_nodes_py')).toContain('listener')
    expect(out('under-run')).toMatch(/\[talker\]: Publishing: "Hello World: \d+"/)
  })

  it('with the overlay sourced, the overlay comes first in AMENT_PREFIX_PATH', () => {
    expect(amentPrefixPath(both)).toBe(out('over-ament'))
  })

  it('the overlay copy wins, and its talker is the one that runs', () => {
    expect(findPackage(both, 'demo_nodes_py')!.path).toBe(out('over-prefix'))
    expect(out('over-run')).toBe('Hi from demo_nodes_py.')
  })

  it('the whole underlay package is hidden, including programs the overlay does not have', () => {
    expect(executables(both, 'demo_nodes_py')).toEqual(['talker'])
    expect(out('over-executables')).toBe('demo_nodes_py talker')
    expect(out('over-missing')).toBe('No executable found')
  })

  it('a package nobody has is not found', () => {
    expect(findPackage(UNDERLAY, 'my_robot')).toBeNull()
    expect(out('prefix-before')).toBe('Package not found')
  })

  it('a freshly built workspace is searched before Jazzy too', () => {
    const ws = overlay([{ path: '/opt/ros/jazzy', packages: {} }], '/root/ws', { my_robot: [] })
    expect(amentPrefixPath(ws)).toBe(out('ament-after'))
    expect(findPackage(ws, 'my_robot')!.path).toBe(out('prefix-after'))
  })
})
