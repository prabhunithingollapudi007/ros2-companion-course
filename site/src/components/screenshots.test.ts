/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Every <Screenshot name="..."> in a lesson names a file the recordings took.

const lessons = new URL('../lessons/', import.meta.url)
const shots = new URL('../../public/shots/', import.meta.url)

describe('screenshots', () => {
  for (const file of readdirSync(lessons).filter((f: string) => f.endsWith('.mdx'))) {
    const text = readFileSync(new URL(file, lessons), 'utf8')
    const names = [...text.matchAll(/<Screenshot\s+name="([^"]+)"/g)].map((m) => m[1])
    if (names.length === 0) continue
    it(`${file} shows only recorded screenshots`, () => {
      for (const name of names) expect(existsSync(new URL(name, shots)), name).toBe(true)
    })
  }
})
