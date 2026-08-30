import { describe, expect, it } from 'vitest'
import { findMatches, segmentText } from '../src/lib/match.js'

describe('findMatches', () => {
  it('finds all global matches', () => {
    const re = /ca./g
    expect(findMatches('cat car cart', re)).toEqual([
      { start: 0, end: 3, value: 'cat' },
      { start: 4, end: 7, value: 'car' },
      { start: 8, end: 11, value: 'car' },
    ])
  })

  it('forces global scanning even without g', () => {
    const re = /foo/i
    expect(findMatches('Foo foo FOO', re).map((m) => m.value)).toEqual(['Foo', 'foo', 'FOO'])
  })

  it('does not loop forever on zero-length matches', () => {
    const re = /(?=a)/g
    const matches = findMatches('aa', re)
    expect(matches.length).toBe(2)
    expect(matches.every((m) => m.value === '')).toBe(true)
  })
})

describe('segmentText', () => {
  it('returns plain text when there are no matches', () => {
    expect(segmentText('hello', [])).toEqual([{ type: 'text', value: 'hello' }])
  })

  it('interleaves text and match segments', () => {
    const text = 'xxAAyyBBzz'
    const matches = [
      { start: 2, end: 4, value: 'AA' },
      { start: 6, end: 8, value: 'BB' },
    ]
    expect(segmentText(text, matches)).toEqual([
      { type: 'text', value: 'xx' },
      { type: 'match', value: 'AA' },
      { type: 'text', value: 'yy' },
      { type: 'match', value: 'BB' },
      { type: 'text', value: 'zz' },
    ])
  })
})
