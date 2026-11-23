import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

// Every file named LessonNN.mdx in this folder is a lesson; no registration needed.
// A lesson with no file shows its planned outline instead.
const modules = import.meta.glob<{ default: ComponentType }>('./Lesson*.mdx')

/** The lessons that have been written, by number. */
export const WRITTEN: Record<number, LazyExoticComponent<ComponentType>> = {}
for (const [path, load] of Object.entries(modules)) {
  const match = /Lesson(\d+)\.mdx$/.exec(path)
  if (match) WRITTEN[Number(match[1])] = lazy(load)
}

/** Rough reading-and-playing time, shown under the lesson title. Add an entry when a lesson is written. */
export const LESSON_MINUTES: Record<number, number> = {
  1: 40,
  2: 50,
  3: 50,
  4: 70,
  5: 60,
  6: 65,
  7: 60,
  8: 70,
  9: 65,
}
