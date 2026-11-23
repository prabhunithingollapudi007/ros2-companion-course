import { useEffect, useRef, useState } from 'react'
import { SourceList } from '../components/Blocks'
import { LESSONS, findLesson } from '../course'
import { LESSON_MINUTES, WRITTEN } from '../lessons'
import { HOME, lesson as lessonRoute, useLink } from '../router'

interface Props {
  n: number
  done: boolean
  onToggleDone: () => void
}

export function LessonPage({ n, done, onToggleDone }: Props) {
  const found = findLesson(n)
  const articleRef = useRef<HTMLElement>(null)
  const [toc, setToc] = useState<{ id: string; text: string }[]>([])
  const Content = WRITTEN[n]
  const link = useLink()

  // Build "On this page" from the lesson's section headings once it has rendered.
  useEffect(() => {
    const el = articleRef.current
    if (!el) return
    const collect = () => {
      const heads = Array.from(el.querySelectorAll('h2[id]')).map((h) => ({ id: h.id, text: h.textContent ?? '' }))
      setToc((prev) => (prev.length === heads.length && prev.every((p, i) => p.id === heads[i].id) ? prev : heads))
    }
    collect()
    const observer = new MutationObserver(collect)
    observer.observe(el, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [n])

  if (!found) return null
  const { lesson, part } = found
  const prev = LESSONS.find((l) => l.n === n - 1)
  const next = LESSONS.find((l) => l.n === n + 1)

  return (
    <article className="lesson" ref={articleRef}>
      <header className="lesson-head">
        <div className="kicker">
          Part {part.n} · {part.title} · Lesson {lesson.n}
          {LESSON_MINUTES[n] && <> · about {LESSON_MINUTES[n]} minutes</>}
        </div>
        <h1>{lesson.title}</h1>
        <p className="lede">{lesson.summary}</p>
        <details className="fold fold-sources" open={!Content}>
          <summary>
            <span className="fold-tag">Sources</span>
            The lecture and documentation this lesson is built from
          </summary>
          <div className="fold-body">
            <SourceList sources={lesson.sources} />
            <p className="dim small">ETH publishes its slides and exercises as one ZIP on the course page, so ETH entries link there.</p>
          </div>
        </details>
      </header>

      {Content ? (
        <>
          {toc.length > 0 && (
            <nav className="toc" aria-label="On this page">
              <div className="toc-label">On this page</div>
              <ol>
                {toc.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                      {t.text}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="prose">
            <Content />
          </div>
          <div className="done-row">
            <button type="button" className={`btn ${done ? '' : 'btn-primary'}`} onClick={onToggleDone} aria-pressed={done}>
              {done ? '✓ Completed (click to undo)' : 'Mark lesson as complete'}
            </button>
          </div>
        </>
      ) : (
        <div className="prose">
          <aside className="callout callout-plain">
            <div className="callout-label">Planned</div>
            <div className="callout-body">
              <p>This lesson is not written yet. Below is what it will cover; the sources above are already worth reading.</p>
            </div>
          </aside>
          <h2>Topics</h2>
          <ul>
            {lesson.topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {lesson.playgrounds.length > 0 && (
            <>
              <h2>Planned playgrounds</h2>
              <ul>
                {lesson.playgrounds.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
          <h2>Planned lab</h2>
          <p>{lesson.lab}</p>
        </div>
      )}

      <nav className="pager" aria-label="Lessons">
        {prev ? (
          <a href={link(lessonRoute(prev.n))} className="pager-link">
            <span className="dim">← Lesson {prev.n}</span>
            {prev.title}
          </a>
        ) : (
          <a href={link(HOME)} className="pager-link">
            <span className="dim">←</span>
            Start here
          </a>
        )}
        {next && (
          <a href={link(lessonRoute(next.n))} className="pager-link pager-next">
            <span className="dim">Lesson {next.n} →</span>
            {next.title}
          </a>
        )}
      </nav>
    </article>
  )
}
