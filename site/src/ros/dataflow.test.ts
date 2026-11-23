import { describe, expect, it } from 'vitest'
import { lesson01 } from '../transcripts'
import { LINE_FOLLOWER, TALKER_LISTENER, flow } from './dataflow'

const { runs } = lesson01
const out = (id: string) => runs[id].output
const count = (id: string) => Number(out(id))

describe('the model agrees with the recording of stopping and restarting the talker', () => {
  it('with both running, both are listed and the listener receives', () => {
    expect(out('both-running')).toBe('/listener\n/talker')
    expect(flow(TALKER_LISTENER, new Set()).state).toEqual({ talker: 'running', listener: 'running' })
  })

  it('with the talker stopped, the listener is still running but receives nothing', () => {
    expect(out('after-stop')).toBe('/listener')
    expect(count('heard-at-stop')).toBeGreaterThan(0)
    expect(count('heard-while-stopped')).toBe(count('heard-at-stop'))
    expect(flow(TALKER_LISTENER, new Set(['talker'])).state).toEqual({ talker: 'stopped', listener: 'waiting' })
  })

  it('a restarted talker is heard without restarting the listener, and counts from 1 again', () => {
    expect(out('after-restart')).toBe('/listener\n/talker')
    expect(count('heard-after-restart')).toBeGreaterThan(count('heard-while-stopped'))
    expect(out('talker-again').split('\n')[0]).toMatch(/Publishing: 'Hello World: 1'$/)
    expect(flow(TALKER_LISTENER, new Set()).state.listener).toBe('running')
  })
})

describe('the line-following robot', () => {
  it('runs end to end when nothing is stopped', () => {
    const { state, live } = flow(LINE_FOLLOWER, new Set())
    expect(Object.values(state).every((s) => s === 'running')).toBe(true)
    expect([...live].sort()).toEqual(['/cmd_vel', '/image', '/line_offset'])
  })

  it('stopping the line detector leaves the camera and the recorder working, and the rest waiting', () => {
    const { state } = flow(LINE_FOLLOWER, new Set(['line_detector']))
    expect(state).toEqual({
      camera_driver: 'running',
      line_detector: 'stopped',
      recorder: 'running',
      steering: 'waiting',
      motor_driver: 'waiting',
    })
  })

  it('stopping the camera leaves every other node alive but waiting', () => {
    const { state, live } = flow(LINE_FOLLOWER, new Set(['camera_driver']))
    expect(state.camera_driver).toBe('stopped')
    for (const name of ['line_detector', 'recorder', 'steering', 'motor_driver']) expect(state[name]).toBe('waiting')
    expect(live.size).toBe(0)
  })

  it('in one big program, stopping any part stops everything', () => {
    const { state } = flow(LINE_FOLLOWER, new Set(['recorder']), true)
    expect(Object.values(state).every((s) => s === 'stopped')).toBe(true)
  })
})
