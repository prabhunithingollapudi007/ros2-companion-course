import { describe, expect, it } from 'vitest'
import { lesson06 } from '../transcripts'
import { lesson06Lab } from './lesson06.lab'

// Each statement Lesson06.mdx makes, checked against what the commands printed
// in the course container, and every lab answer against the same recordings.

const out = (id: string) => lesson06.runs[id].output
const lines = (id: string) => out(id).split('\n')

describe('what Lesson 6 says, against the recordings', () => {
  it('a bag is a folder with metadata.yaml and an .mcap file', () => {
    expect(lines('bag-folder')).toEqual(['metadata.yaml', 'talk_0.mcap'])
    expect(out('bag-info-stable')).toContain('Storage id:        mcap')
    expect(out('bag-info-stable')).toMatch(/Topic: \/chatter \| Type: std_msgs\/msg\/String \| Count: \d+/)
  })

  it('recording with positional topics is deprecated in Jazzy; --topics and -a are the forms to use', () => {
    expect(out('record-old')).toContain('Positional "topics" argument deprecated')
    expect(out('record-help')).toMatch(/^ {2}-a, --all/m)
    expect(out('record-help')).toMatch(/^ {2}--topics/m)
    expect(out('record')).toContain("Subscribed to topic '/chatter'")
  })

  it('a listener hears the replayed messages', () => {
    expect(Number(out('replayed-count'))).toBeGreaterThan(0)
    expect(out('listener-replayed')).toMatch(/I heard: \[Hello World: \d+\]/)
  })

  it('a header is a stamp of seconds and nanoseconds, and a frame_id', () => {
    expect(out('header')).toContain('builtin_interfaces/Time stamp')
    expect(out('header')).toContain('string frame_id')
  })

  it('the weather bag holds 120 temperature and 30 humidity readings over just under 30 s, stamped in May 2026', () => {
    expect(out('weather-info')).toContain('Count: 120')
    expect(out('weather-info')).toContain('Count: 30')
    expect(out('weather-info')).toContain('Messages:          150')
    expect(out('weather-info')).toContain('May 28 2026 20:26:40')
    expect(out('echo-temperature')).toMatch(/sec: 1780000\d{3}\n {4}nanosec: \d+\n {2}frame_id: weather_station/)
  })

  it('bag play --clock publishes the recorded time on /clock', () => {
    expect(out('clock-once')).toMatch(/^clock:\n {2}sec: 1780000\d{3}/)
  })
})

describe('the Lesson 6 lab', () => {
  it('the checker fails before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 6 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 6 checks passed\.$/)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['120', 'weather_station', '2026-05-28', '0', '6']
    const wrong = ['150', 'map', '2026-11-23', '30', '5']
    lesson06Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
    expect(out('weather-info')).toContain('Count: 120')
    expect(out('sim-during')).toContain('2026-05-28')
  })
})
