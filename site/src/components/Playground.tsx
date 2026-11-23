import type { ReactNode } from 'react'

/** The frame every interactive panel sits in. */
export function Playground({ title, children, caption }: { title: string; children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="playground viz-root">
      <header className="playground-head">
        <span className="playground-tag">Interactive</span>
        <h3 className="playground-title">{title}</h3>
      </header>
      <div className="playground-body">{children}</div>
      {caption && <figcaption className="playground-caption">{caption}</figcaption>}
    </figure>
  )
}

interface SliderProps {
  label: ReactNode
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
  hint?: string
}

export function Slider({ label, value, min, max, step, onChange, format, hint }: SliderProps) {
  return (
    <label className="slider">
      <span className="slider-top">
        <span className="slider-label">{label}</span>
        <output className="slider-value">{format ? format(value) : value}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <span className="slider-hint">{hint}</span>}
    </label>
  )
}

export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  )
}
