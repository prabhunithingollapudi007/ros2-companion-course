import { useCallback, useEffect, useSyncExternalStore } from 'react'

// Progress lives in this browser only. Every read and write is guarded so the
// site still works if storage is blocked.
//
// Pages are also rendered once at build time, where there is no browser storage.
// Each hook therefore names what that first render should assume (nothing
// completed, no saved theme) and switches to the stored values once it is in
// the browser.

const KEY = 'ros-companion.progress.v1'
const THEME_KEY = 'ros-companion.theme'

const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const changed = () => listeners.forEach((listener) => listener())

const NONE: number[] = []
let completedNow: number[] | null = null

function readCompleted(): number[] {
  if (completedNow) return completedNow
  completedNow = NONE
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { completed?: unknown }
      if (Array.isArray(parsed.completed)) completedNow = parsed.completed as number[]
    }
  } catch {
    /* storage unavailable */
  }
  return completedNow
}

export function useProgress() {
  const completed = useSyncExternalStore(subscribe, readCompleted, () => NONE)

  const toggle = useCallback((lesson: number) => {
    const prev = readCompleted()
    completedNow = prev.includes(lesson) ? prev.filter((n) => n !== lesson) : [...prev, lesson]
    try {
      localStorage.setItem(KEY, JSON.stringify({ completed: completedNow }))
    } catch {
      /* storage unavailable */
    }
    changed()
  }, [])

  return { completed, toggle }
}

export type Theme = 'light' | 'dark'

let savedTheme: Theme | null | undefined

function readTheme(): Theme | null {
  if (savedTheme !== undefined) return savedTheme
  savedTheme = null
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') savedTheme = saved
  } catch {
    /* storage unavailable */
  }
  return savedTheme
}

const DARK_QUERY = '(prefers-color-scheme: dark)'
const subscribeSystem = (listener: () => void) => {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => null)
  const systemDark = useSyncExternalStore(
    subscribeSystem,
    () => window.matchMedia(DARK_QUERY).matches,
    () => true,
  )

  // index.html applies a saved theme before the page is drawn; this keeps it in step afterwards.
  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const effective: Theme = theme ?? (systemDark ? 'dark' : 'light')

  const toggle = () => {
    savedTheme = effective === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(THEME_KEY, savedTheme)
    } catch {
      /* storage unavailable */
    }
    changed()
  }

  return { theme: effective, toggle }
}
