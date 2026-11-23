// Reading a lab answer the forgiving way: case, spacing, quotes, a trailing full
// stop, units after a number and the leading slash of a name do not matter.

/** Lower case, no surrounding space, quotes or full stop. */
export const tidy = (answer: string) =>
  answer
    .trim()
    .toLowerCase()
    .replace(/^["'`]+|["'`.]+$/g, '')
    .trim()

/** The first number in an answer, so that "50", "50 Hz" and "about 50" all read as 50. */
export const numberIn = (answer: string): number | null => {
  const match = /-?\d+(\.\d+)?/.exec(answer)
  return match ? Number(match[0]) : null
}

/** A node or topic name, with or without its leading slash. */
export const isName = (answer: string, name: string) => tidy(answer).replace(/^\//, '') === name.replace(/^\//, '')
