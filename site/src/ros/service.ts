// Asking for the count, two ways, for the Lesson 10 playground: as a topic the
// counter publishes to everyone, and as a service each client calls. The service
// side models what the recordings show: a client waits until the server exists,
// and a server with one thread answers one request at a time, in order.

export interface Call {
  client: string
  /** When the client wants the answer, in seconds. */
  at: number
}

export interface Answered extends Call {
  /** When the request went out: once the server exists. */
  sent: number
  /** When the server began on it: once it had finished the requests before. */
  started: number
  /** When the response arrived. */
  answered: number
}

/** Every call, answered by one server that starts at `serverUpAt` and takes `work` seconds per request. */
export function serve(calls: Call[], serverUpAt: number, work: number): Answered[] {
  const ordered = calls.map((c) => ({ ...c, sent: Math.max(c.at, serverUpAt) })).sort((a, b) => a.sent - b.sent)
  let free = serverUpAt
  return ordered.map((c) => {
    const started = Math.max(c.sent, free)
    free = started + work
    return { ...c, started, answered: free }
  })
}

/** The times a publisher started at `upAt` publishes, every `period` seconds, up to `until`. */
export function publishTimes(upAt: number, period: number, until: number) {
  const times: number[] = []
  for (let t = upAt; t <= until + 1e-9; t += period) times.push(Number(t.toFixed(9)))
  return times
}

/** What a subscriber reading at `at` has: the latest message published by then, and how old it is. */
export function latestAt(at: number, published: number[]) {
  const before = published.filter((t) => t <= at + 1e-9)
  if (before.length === 0) return null
  const last = before[before.length - 1]
  return { publishedAt: last, age: at - last }
}
