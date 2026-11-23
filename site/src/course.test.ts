import { describe, expect, it } from 'vitest'
import { LESSONS, PARTS, findLesson } from './course'

describe('the course outline', () => {
  it('numbers the lessons 1 to 17 in order, with no gaps', () => {
    expect(LESSONS.map((l) => l.n)).toEqual(Array.from({ length: 17 }, (_, i) => i + 1))
  })

  it('numbers the parts in order', () => {
    expect(PARTS.map((p) => p.n)).toEqual(PARTS.map((_, i) => i + 1))
  })

  it('gives every lesson a title, a summary, topics, a lab and at least one source', () => {
    for (const l of LESSONS) {
      expect(l.title.length).toBeGreaterThan(3)
      expect(l.summary.length).toBeGreaterThan(40)
      expect(l.topics.length).toBeGreaterThanOrEqual(4)
      expect(l.lab.length).toBeGreaterThan(20)
      expect(l.sources.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('has no repeated titles, topics or source labels within a lesson', () => {
    expect(new Set(LESSONS.map((l) => l.title)).size).toBe(LESSONS.length)
    for (const l of LESSONS) {
      expect(new Set(l.topics).size).toBe(l.topics.length)
      expect(new Set(l.sources.map((s) => s.label)).size).toBe(l.sources.length)
    }
  })

  it('links every source to a web address', () => {
    for (const l of LESSONS) for (const s of l.sources) expect(s.url).toMatch(/^https?:\/\/[^\s]+$/)
  })

  it('finds a lesson and the part it belongs to', () => {
    expect(findLesson(8)?.lesson.title).toBe('TF2: coordinate frames over time')
    expect(findLesson(8)?.part.n).toBe(3)
    expect(findLesson(18)).toBeUndefined()
  })
})
