// The life of an action goal, for the Lesson 11 playground: the states of
// action_msgs/msg/GoalStatus and what moves a goal between them. lesson11.test.ts
// walks it through what the recordings show: accepted then succeeded, rejected,
// and accepted, cancel requested, then canceled.

export type GoalState = 'none' | 'rejected' | 'accepted' | 'executing' | 'canceling' | 'succeeded' | 'canceled' | 'aborted'

export type GoalEvent = 'send' | 'reject' | 'accept' | 'execute' | 'feedback' | 'cancel' | 'succeed' | 'finish canceled' | 'abort'

/** The status codes in action_msgs/msg/GoalStatus, as ros2 action prints them. */
export const STATUS: Partial<Record<GoalState, { code: number; name: string }>> = {
  accepted: { code: 1, name: 'ACCEPTED' },
  executing: { code: 2, name: 'EXECUTING' },
  canceling: { code: 3, name: 'CANCELING' },
  succeeded: { code: 4, name: 'SUCCEEDED' },
  canceled: { code: 5, name: 'CANCELED' },
  aborted: { code: 6, name: 'ABORTED' },
}

/** Which part of an action carries each event: its three services and two topics. */
export const CARRIER: Record<GoalEvent, string> = {
  send: 'send_goal service (request)',
  reject: 'send_goal service (response: rejected)',
  accept: 'send_goal service (response: accepted)',
  execute: 'status topic',
  feedback: 'feedback topic',
  cancel: 'cancel_goal service',
  succeed: 'get_result service, and the status topic',
  'finish canceled': 'get_result service, and the status topic',
  abort: 'get_result service, and the status topic',
}

const MOVES: Record<GoalState, Partial<Record<GoalEvent, GoalState>>> = {
  none: { send: 'none' },
  rejected: {},
  accepted: { execute: 'executing', cancel: 'canceling' },
  executing: { feedback: 'executing', cancel: 'canceling', succeed: 'succeeded', abort: 'aborted' },
  canceling: { feedback: 'canceling', 'finish canceled': 'canceled', succeed: 'succeeded', abort: 'aborted' },
  succeeded: {},
  canceled: {},
  aborted: {},
}

/** A goal that has been sent but not yet answered. */
export interface Goal {
  state: GoalState
  sent: boolean
}

export const START: Goal = { state: 'none', sent: false }

/** What may happen next. */
export function allowed(goal: Goal): GoalEvent[] {
  if (goal.state === 'none') return goal.sent ? ['accept', 'reject'] : ['send']
  return Object.keys(MOVES[goal.state]) as GoalEvent[]
}

/** The goal after an event, or the same goal if the event cannot happen now. */
export function step(goal: Goal, event: GoalEvent): Goal {
  if (!allowed(goal).includes(event)) return goal
  if (goal.state === 'none') {
    if (event === 'send') return { state: 'none', sent: true }
    return { state: event === 'accept' ? 'accepted' : 'rejected', sent: true }
  }
  return { ...goal, state: MOVES[goal.state][event] ?? goal.state }
}

/** Whether the goal is over: nothing more can happen to it. */
export const finished = (goal: Goal) => goal.sent && allowed(goal).length === 0
