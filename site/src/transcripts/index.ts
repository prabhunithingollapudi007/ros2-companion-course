import type { Run } from '../components/Terminal'
import lesson01Data from './lesson01.json'
import lesson02Data from './lesson02.json'
import lesson03Data from './lesson03.json'
import lesson04Data from './lesson04.json'
import lesson05Data from './lesson05.json'
import lesson06Data from './lesson06.json'
import lesson07Data from './lesson07.json'
import lesson08Data from './lesson08.json'
import lesson09Data from './lesson09.json'
import lesson10Data from './lesson10.json'
import lesson11Data from './lesson11.json'
import lesson12Data from './lesson12.json'
import lesson13Data from './lesson13.json'
import lesson14Data from './lesson14.json'
import lesson15Data from './lesson15.json'

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
export const lesson03 = lesson03Data as Transcript
export const lesson04 = lesson04Data as Transcript
export const lesson05 = lesson05Data as Transcript
export const lesson06 = lesson06Data as Transcript
export const lesson07 = lesson07Data as Transcript
export const lesson08 = lesson08Data as Transcript
export const lesson09 = lesson09Data as Transcript
export const lesson10 = lesson10Data as Transcript
export const lesson11 = lesson11Data as Transcript
export const lesson12 = lesson12Data as Transcript
export const lesson13 = lesson13Data as Transcript
export const lesson14 = lesson14Data as Transcript
export const lesson15 = lesson15Data as Transcript
