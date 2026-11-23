// Quality of service, for the Lesson 14 playgrounds. A publisher offers a policy
// and a subscription requests one; they connect only if what is offered is at
// least what is requested. lesson14.test.ts checks this against the warnings the
// recordings show ("Last incompatible policy: RELIABILITY" and "DURABILITY").

export type Reliability = 'reliable' | 'best_effort'
export type Durability = 'transient_local' | 'volatile'

export interface Qos {
  reliability: Reliability
  durability: Durability
}

/** Whether a publisher offering `pub` and a subscription requesting `sub` connect, and if not, which policy is to blame. */
export function compatible(pub: Qos, sub: Qos): { ok: true } | { ok: false; policy: 'RELIABILITY' | 'DURABILITY' } {
  if (pub.reliability === 'best_effort' && sub.reliability === 'reliable') return { ok: false, policy: 'RELIABILITY' }
  if (pub.durability === 'volatile' && sub.durability === 'transient_local') return { ok: false, policy: 'DURABILITY' }
  return { ok: true }
}

/** The values ros2 topic info -v and the QoS warnings print. */
export const POLICY_NAME: Record<Reliability | Durability, string> = {
  reliable: 'RELIABLE',
  best_effort: 'BEST_EFFORT',
  transient_local: 'TRANSIENT_LOCAL',
  volatile: 'VOLATILE',
}

// ---------- A lossy link ----------

/** A fixed pseudo-random number in [0, 1) for message i, attempt k: the same every time, so the playground is repeatable. */
export function chance(i: number, k: number, seed = 1) {
  let h = (i * 374761393 + k * 668265263 + seed * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

export interface Delivery {
  sent: number
  /** When the subscriber got it, or null if it never did. */
  at: number | null
}

/**
 * Messages sent every `period` seconds over a link that loses each packet with probability `loss`
 * and takes `delay` seconds. Best effort sends each once. Reliable resends a lost one after
 * `resend` seconds until it arrives, and hands messages over in order, so a late one holds up those behind it.
 */
export function deliver(n: number, period: number, loss: number, delay: number, mode: Reliability, resend = 0.2): Delivery[] {
  const out: Delivery[] = []
  let lastHandedOver = 0
  for (let i = 0; i < n; i++) {
    const sent = i * period
    if (mode === 'best_effort') {
      out.push({ sent, at: chance(i, 0) < loss ? null : sent + delay })
      continue
    }
    let k = 0
    while (chance(i, k) < loss && k < 50) k++
    const arrived = sent + k * resend + delay
    lastHandedOver = Math.max(arrived, lastHandedOver)
    out.push({ sent, at: lastHandedOver })
  }
  return out
}
