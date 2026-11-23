import type { ReactNode } from 'react'
import { ARROWS } from './arrows'
import './figures.css'

interface Props {
  /** Read by screen readers in place of the drawing. */
  label: string
  width?: number
  height: number
  caption?: ReactNode
  children: ReactNode
}

/** A static diagram: an SVG that follows the site theme, with a caption. */
export function Figure({ label, width = 720, height, caption, children }: Props) {
  return (
    <figure className="figure viz-root">
      <div className="figure-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="figure-svg">
          <defs>
            {ARROWS.map((name) => (
              <marker
                key={name}
                id={`fig-arrow-${name}`}
                markerUnits="userSpaceOnUse"
                markerWidth={10}
                markerHeight={10}
                refX={8.5}
                refY={5}
                orient="auto-start-reverse"
              >
                <path d="M0,1 L9,5 L0,9 Z" className={`fig-fill-${name}`} />
              </marker>
            ))}
          </defs>
          {children}
        </svg>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
