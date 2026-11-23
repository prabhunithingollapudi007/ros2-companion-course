import { useState, type ReactNode } from 'react'
import { Terminal, type Run } from '../components/Terminal'
import './lab.css'

export interface LabQuestion {
  prompt: ReactNode
  /** Shown in the input before anything is typed. */
  placeholder?: string
  /** True if the reader's answer is right. */
  check: (answer: string) => boolean
  /** The right answer, in words. */
  answer: string
  /** The recorded commands that find the answer, shown once the reader asks. */
  how: Run[]
}

type Verdict = 'right' | 'wrong' | null

function Question({ n, q, onRight }: { n: number; q: LabQuestion; onRight: () => void }) {
  const [value, setValue] = useState('')
  const [verdict, setVerdict] = useState<Verdict>(null)
  const [shown, setShown] = useState(false)

  const submit = () => {
    if (!value.trim()) return
    const right = q.check(value)
    setVerdict(right ? 'right' : 'wrong')
    if (right) onRight()
  }

  return (
    <li className={`lab-q ${verdict ? `is-${verdict}` : ''}`}>
      <div className="lab-q-prompt">
        <span className="quiz-n">{n}</span>
        <div>{q.prompt}</div>
      </div>
      <form
        className="lab-q-form"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <input
          value={value}
          placeholder={q.placeholder ?? 'Your answer'}
          aria-label={`Answer to question ${n}`}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setValue(e.target.value)
            setVerdict(null)
          }}
        />
        <button type="submit" className="btn btn-small">
          Check
        </button>
        <button type="button" className="btn btn-quiet btn-small" onClick={() => setShown((s) => !s)} aria-expanded={shown}>
          {shown ? 'Hide the answer' : 'Show how to find it'}
        </button>
      </form>
      {verdict && (
        <p className="lab-q-verdict" role="status">
          {verdict === 'right' ? `Right: ${q.answer}.` : 'Not that one. Look again, or open "Show how to find it".'}
        </p>
      )}
      {shown && (
        <div className="lab-q-how">
          <p className="small">
            Answer: <strong>{q.answer}</strong>. Recorded with the robot running:
          </p>
          <Terminal run={q.how} />
        </div>
      )}
    </li>
  )
}

/** The lab's questions. Each answer is checked in the page; nothing is sent anywhere. */
export function LabQuestions({ questions }: { questions: LabQuestion[] }) {
  const [right, setRight] = useState<Set<number>>(() => new Set())
  return (
    <div className="lab-questions">
      <ol className="lab-q-list">
        {questions.map((q, i) => (
          <Question key={i} n={i + 1} q={q} onRight={() => setRight((s) => new Set(s).add(i))} />
        ))}
      </ol>
      <p className="quiz-score">
        {right.size === questions.length
          ? `All ${questions.length} answered. You can read a running ROS system from the terminal.`
          : `${right.size} of ${questions.length} answered.`}
      </p>
    </div>
  )
}
