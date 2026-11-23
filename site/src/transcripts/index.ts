import type { Run } from '../components/Terminal'
import lesson01Data from './lesson01.json'
import lesson02Data from './lesson02.json'

// The terminal sessions the lessons show, as recorded in the course container
// by scripts/transcripts.mjs. The .json files are written by that script; do
// not edit them by hand. To change what a lesson shows, edit its
// .scenarios.json and record again with `npm run transcripts`.

export interface Transcript {
  meta: {
    /** The container image the commands ran in. */
    image: string
    /** The day they were recorded. */
    recorded: string
    /** Versions of the packages that decide what the commands print. */
    versions: Record<string, string>
  }
  runs: Record<string, Run>
}

export const lesson01 = lesson01Data as Transcript
export const lesson02 = lesson02Data as Transcript
