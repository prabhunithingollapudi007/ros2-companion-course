// What a node's clock reads while a bag is replayed, as Lesson 6 explains it.
//
// Without use_sim_time a node reads the computer's clock. With use_sim_time it
// reads ROS time, which comes only from the /clock topic: before anything
// publishes /clock it is zero and timers do not fire; ros2 bag play --clock
// publishes the recorded time, advancing `rate` recorded seconds per real second.
// clock.test.ts checks this against the recordings of what_time.py.

export interface ClockSetup {
  /** The node was started with use_sim_time:=true. */
  simTime: boolean
  /** The bag is played with --clock. */
  clock: boolean
  /** --rate */
  rate: number
  /** When playing starts, in real seconds after the node started. */
  playAt: number
}

/**
 * The node's clock, in seconds, at real time `t` after the node started.
 * `wallStart` is the computer's clock then and `bagStart` the bag's first stamp.
 * Returns 0 for a simulated clock that has not received /clock yet.
 */
export function nodeClock(t: number, setup: ClockSetup, wallStart: number, bagStart: number): number {
  if (!setup.simTime) return wallStart + t
  if (!setup.clock || t < setup.playAt) return 0
  return bagStart + setup.rate * (t - setup.playAt)
}

/** Real times at which a once-a-second timer fires: on the node's own clock, every whole second of it. */
export function timerTicks(setup: ClockSetup, seconds: number, step = 0.01): number[] {
  const ticks: number[] = []
  let next = 1
  for (let t = 0; t <= seconds + 1e-9; t += step) {
    const elapsed = setup.simTime ? (setup.clock && t >= setup.playAt ? setup.rate * (t - setup.playAt) : -1) : t
    if (elapsed >= next - 1e-9) {
      ticks.push(+t.toFixed(2))
      next += 1
    }
  }
  return ticks
}
