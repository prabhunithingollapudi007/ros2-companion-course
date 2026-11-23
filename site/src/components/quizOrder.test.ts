import { describe, expect, it } from 'vitest'
import type { Question } from './Quiz'
import { optionOrder } from './quizOrder'

const files = import.meta.glob<Record<string, Question[]>>('../lessons/lesson*.quiz.ts', { eager: true })
const lessons = import.meta.glob('../lessons/Lesson*.mdx')
const quizzes = Object.entries(files).map(([path, module]) => ({ path, questions: Object.values(module)[0] }))
const all = quizzes.flatMap((q) => q.questions)

describe('every quiz', () => {
  it('there is one per written lesson', () => {
    expect(quizzes).toHaveLength(Object.keys(lessons).length)
  })
  it('each question has at least three distinct options and an answer among them', () => {
    for (const q of all) {
      expect(q.options.length).toBeGreaterThanOrEqual(3)
      expect(new Set(q.options).size).toBe(q.options.length)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.options.length)
      expect(q.explain.length).toBeGreaterThan(20)
    }
  })
  it('prompts are unique within a quiz', () => {
    for (const { questions } of quizzes) expect(new Set(questions.map((q) => q.prompt)).size).toBe(questions.length)
  })
})

describe('the order options are shown in', () => {
  // Stand-ins written the way real questions tend to be, with the right answer
  // second, so the shuffle is checked even before any quiz exists.
  const standIns: Question[] = Array.from({ length: 200 }, (_, i) => ({
    prompt: `Stand-in question number ${i}: which of these is right?`,
    options: ['A plausible wrong answer', 'The right answer', 'Another wrong answer', 'A third wrong answer'],
    answer: 1,
    explain: 'Only here to exercise the shuffle.',
  }))

  it('is a rearrangement of the options, the same every time', () => {
    for (const q of [...all, ...standIns]) {
      const order = optionOrder(q.prompt, q.options)
      expect(order.slice().sort()).toEqual(q.options.map((_, i) => i))
      expect(optionOrder(q.prompt, q.options)).toEqual(order)
    }
  })

  const spread = (questions: Question[]) => {
    const shown = [0, 0, 0, 0]
    for (const q of questions) shown[optionOrder(q.prompt, q.options).indexOf(q.answer)] += 1
    return shown.map((count) => count / questions.length)
  }

  it('does not give the answer away by position', () => {
    for (const share of spread(standIns)) {
      expect(share).toBeLessThan(0.36)
      expect(share).toBeGreaterThan(0.14)
    }
  })
  // The same check on the real quizzes, once there are enough questions for the shares to mean something.
  it.skipIf(all.length < 60)('does not give the answer away by position in the real quizzes', () => {
    for (const share of spread(all)) {
      expect(share).toBeLessThan(0.36)
      expect(share).toBeGreaterThan(0.14)
    }
  })
  it('keeps "none of the above" last', () => {
    const order = optionOrder('any prompt', ['First', 'Second', 'Third', 'None of the above'])
    expect(order[3]).toBe(3)
  })
  it('leaves a scale of numbers in the order it was written', () => {
    expect(optionOrder('How often?', ['99%', '50%', '13%', '1%'])).toEqual([0, 1, 2, 3])
  })
})
