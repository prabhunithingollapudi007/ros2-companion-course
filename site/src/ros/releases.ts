// ROS releases drawn in Lesson 1's timeline.
//
// Source: the ROS 2 documentation's list of distributions
// (https://docs.ros.org/en/jazzy/Releases.html, read from its source file on
// 2026-11-23) and, for ROS 1, the ROS wiki's Distributions page
// (http://wiki.ros.org/Distributions). Months are 1-12.

export interface Release {
  name: string
  /** ROS 1 or ROS 2. */
  generation: 1 | 2
  released: { year: number; month: number }
  /** End of support. */
  eol: { year: number; month: number }
  /** Long-term support: about five years instead of about one and a half. */
  lts: boolean
}

export const RELEASES: Release[] = [
  { name: 'Box Turtle', generation: 1, released: { year: 2010, month: 3 }, eol: { year: 2011, month: 3 }, lts: false },
  { name: 'Noetic Ninjemys', generation: 1, released: { year: 2020, month: 5 }, eol: { year: 2025, month: 5 }, lts: true },
  { name: 'Ardent Apalone', generation: 2, released: { year: 2017, month: 12 }, eol: { year: 2018, month: 12 }, lts: false },
  { name: 'Foxy Fitzroy', generation: 2, released: { year: 2020, month: 6 }, eol: { year: 2023, month: 6 }, lts: true },
  { name: 'Humble Hawksbill', generation: 2, released: { year: 2022, month: 5 }, eol: { year: 2027, month: 5 }, lts: true },
  { name: 'Jazzy Jalisco', generation: 2, released: { year: 2024, month: 5 }, eol: { year: 2029, month: 5 }, lts: true },
  { name: 'Kilted Kaiju', generation: 2, released: { year: 2025, month: 5 }, eol: { year: 2026, month: 12 }, lts: false },
  { name: 'Lyrical Luth', generation: 2, released: { year: 2026, month: 5 }, eol: { year: 2031, month: 5 }, lts: true },
]

/** Years since 2009 as a fraction, for drawing. */
export const when = (d: { year: number; month: number }) => d.year + (d.month - 1) / 12

export const supportYears = (r: Release) => when(r.eol) - when(r.released)

export const release = (name: string) => {
  const found = RELEASES.find((r) => r.name.startsWith(name))
  if (!found) throw new Error(`No release called ${name}`)
  return found
}
