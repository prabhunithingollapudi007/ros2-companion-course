import { COURSE_LINKS, LESSONS, PARTS, REPO_URL, ROS_DISTRO } from '../course'
import { WRITTEN } from '../lessons'
import { lesson, useLink } from '../router'

export function Home({ completed }: { completed: number[] }) {
  const link = useLink()
  const written = LESSONS.filter((l) => WRITTEN[l.n]).length
  const first = LESSONS.find((l) => WRITTEN[l.n])?.n ?? 1
  return (
    <article className="lesson">
      <header className="lesson-head">
        <div className="kicker">Start here</div>
        <h1>How to use this companion</h1>
        <p className="lede">
          One path through ROS 2 in {LESSONS.length} lessons, following ETH Zurich's Programming for Robotics course and
          ending in a simulated-robot project. An unofficial companion, not part of that course.
        </p>
      </header>

      <div className="prose">
        {written < LESSONS.length && (
          <aside className="callout callout-plain">
            <div className="callout-label">Status</div>
            <div className="callout-body">
              <p>
                {written === 0
                  ? `This site is at the outline stage. All ${LESSONS.length} lessons are planned and none is written yet; each lesson page shows what it will cover and where to read about it now.`
                  : `${written} of the ${LESSONS.length} lessons ${written === 1 ? 'is' : 'are'} written. The rest are marked "planned" and show their outline.`}
              </p>
            </div>
          </aside>
        )}

        <h2>What this is</h2>
        <p>
          A study layer that sits beside the course. ETH's slides and the ROS documentation do the teaching; this site
          aims to make each idea something you can see, poke at and build. It assumes you can program in C++ and
          Python and are comfortable in a Linux terminal, and that you have not used ROS. Everything targets
          ROS 2 {ROS_DISTRO}, the release the 2026 course uses.
        </p>
        <p>Each lesson is planned around the same parts, in the same order:</p>
        <ul>
          <li>
            <strong>Big picture.</strong> Where the lesson sits and what problem it solves.
          </li>
          <li>
            <strong>Figures and playgrounds.</strong> Each key concept is drawn first and explained second. Interactive
            panels simulate the idea in the page (a node graph, a frame tree, a queue filling up), so you can change
            things and watch what happens before touching a terminal.
          </li>
          <li>
            <strong>Commands and code.</strong> The terminal commands and C++ you need, kept short, with a
            plain-language restatement of anything subtle.
          </li>
          <li>
            <strong>Lab and quiz.</strong> A hands-on task in a ROS 2 container, then a short quiz to check what stuck.
          </li>
          <li>
            <strong>Quick recap.</strong> A short card you can reread months later without the rest of the lesson.
          </li>
        </ul>

        <h2>A loop that works</h2>
        <ol>
          <li>Read the big picture and play with the playgrounds.</li>
          <li>Go through the lecture and documentation pages listed under Sources. They will read like revision.</li>
          <li>Do the lab in the container.</li>
          <li>Take the quiz, then mark the lesson complete.</li>
        </ol>

        <h2>The course in one map</h2>
        <div className="map">
          {PARTS.map((part) => (
            <section className="map-part" key={part.n}>
              <div className="map-head">
                <span className="map-n">Part {part.n}</span>
                <h3>{part.title}</h3>
              </div>
              <p className="map-blurb">{part.blurb}</p>
              <ul className="map-weeks">
                {part.lessons.map((l) => (
                  <li key={l.n}>
                    <a href={link(lesson(l.n))}>
                      <span className="nav-num">{completed.includes(l.n) ? '✓' : String(l.n).padStart(2, '0')}</span>
                      {l.title}
                    </a>
                    {!WRITTEN[l.n] && <span className="nav-soon">planned</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <h2>Official course materials</h2>
        <ul>
          {COURSE_LINKS.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="dim small">
          This is an unofficial, independent study aid. It is not affiliated with, endorsed by, or produced by ETH
          Zurich, the Robotic Systems Lab, the lecturers of the course, or Open Robotics. The course slides and
          exercises belong to their authors and are linked, not copied; the lesson text, figures and code here are
          original, and any mistakes in them are this site's own. Lesson text and figures are shared under CC BY 4.0
          and the code under the MIT licence; the source is <a href={REPO_URL}>on GitHub</a>. Progress you mark here is
          saved in this browser only.
        </p>

        <p>
          <a className="btn btn-primary" href={link(lesson(first))}>
            {first === 1 ? 'Begin with Lesson 1 →' : `Start with Lesson ${first}, the first one written →`}
          </a>
        </p>
      </div>
    </article>
  )
}
