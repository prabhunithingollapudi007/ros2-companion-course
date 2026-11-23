export const ARROWS = ['ink', 'muted', 's1', 's2', 's3'] as const

/** `markerEnd={arrow('s1')}` puts an arrowhead in that colour on a line. */
export const arrow = (name: (typeof ARROWS)[number] = 'ink') => `url(#fig-arrow-${name})`
