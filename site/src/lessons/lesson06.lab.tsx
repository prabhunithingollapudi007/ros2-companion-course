import { numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson06 } from '../transcripts'

// The Lesson 6 lab: a weather station's bag, and a node that pairs its two
// sensors to publish the dew point. labs/lesson06/check.py plays the bag and
// checks every value. Answers are pinned by lesson06.test.ts.

const run = (id: string) => lesson06.runs[id]

export const lesson06Lab: LabQuestion[] = [
  {
    prompt: (
      <p>
        How many temperature readings does the weather bag hold? (<code>ros2 bag info</code>)
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 120,
    answer: '120',
    how: [run('weather-info')],
  },
  {
    prompt: <p>Which frame_id do the readings carry?</p>,
    placeholder: 'A name',
    check: (a) => tidy(a) === 'weather_station',
    answer: 'weather_station',
    how: [run('echo-temperature')],
  },
  {
    prompt: (
      <p>
        Play the bag with <code>--clock</code> and run <code>what_time.py</code> with <code>use_sim_time:=true</code>. Which
        date does its clock show?
      </p>
    ),
    placeholder: 'A date',
    check: (a) => /2026-05-28|28 may 2026|may 28,? 2026/.test(tidy(a)),
    answer: '2026-05-28, when the bag was recorded',
    how: [run('sim-during')],
  },
  {
    prompt: <p>How many pairs would a synchroniser that only matches equal stamps produce from this bag?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 0,
    answer: '0: temperature is read at .03, .28, .53 and .78 s past each second, humidity at .11',
    how: [run('echo-temperature'), run('echo-humidity')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson06/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 6,
    answer: '6 of 6',
    how: [run('lab-check')],
  },
]
