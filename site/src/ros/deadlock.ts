// The caller of Lesson 15, three ways, as blocks of work on the caller's threads.
// A timer fires every second and asks a server that answers in `reply` seconds.
// lesson15.test.ts checks the outcomes against the recordings of `caller`.

export type Mode = 'wait' | 'groups' | 'callback'

export interface Block {
  what: 'timer' | 'response'
  thread: number
  start: number
  end: number
  outcome?: 'answer' | 'timeout'
}

/** What the caller's threads do in `seconds`, for the timer at 1 s, 2 s, ... */
export function callerTimeline(mode: Mode, seconds = 7, reply = 0.05, timeout = 2): Block[] {
  const blocks: Block[] = []
  let free = 0 // when thread 0, the only one the timer runs on, is free again
  for (let due = 1; due <= seconds; due++) {
    const start = Math.max(due, free)
    if (start > seconds || start > due + 0.5) continue // a timer that could not run in time fires at the next free tick
    const answerAt = start + reply
    if (mode === 'wait') {
      // The answer needs this thread, which is waiting: it is handled only after the timeout.
      blocks.push({ what: 'timer', thread: 0, start, end: start + timeout, outcome: 'timeout' })
      blocks.push({ what: 'response', thread: 0, start: start + timeout, end: start + timeout + 0.02 })
      free = start + timeout + 0.02
    } else if (mode === 'groups') {
      // A second thread runs the client's group, so the waiting callback gets its answer.
      blocks.push({ what: 'response', thread: 1, start: answerAt, end: answerAt + 0.02 })
      blocks.push({ what: 'timer', thread: 0, start, end: answerAt + 0.02, outcome: 'answer' })
      free = answerAt + 0.02
    } else {
      // Send and return; the answer is handled later on the same thread, in its own callback.
      blocks.push({ what: 'timer', thread: 0, start, end: start + 0.01 })
      blocks.push({ what: 'response', thread: 0, start: answerAt, end: answerAt + 0.02, outcome: 'answer' })
      free = answerAt + 0.02
    }
  }
  return blocks
}

/** What the caller logs, in order: an answer or a timeout for each request it sent. */
export const outcomes = (blocks: Block[]) => blocks.filter((b) => b.outcome).sort((a, b) => a.start - b.start).map((b) => b.outcome!)
