import { describe, expect, it } from 'vitest'
import {
  compileRegex,
  formatLiteral,
  generatePattern,
  normalizeExamples,
  sanitizeFlags,
  splitInputLines,
} from '../src/lib/generate.js'

describe('normalizeExamples', () => {
  it('drops empties and duplicates while keeping order', () => {
    expect(normalizeExamples(['a', '', 'b', 'a', '  ', null, 'c'])).toEqual(['a', 'b', '  ', 'c'])
  })
})

describe('splitInputLines', () => {
  it('splits on newlines and keeps internal spaces', () => {
    expect(splitInputLines('foo\nbar baz\n\nbaz\r\nqux  ')).toEqual([
      'foo',
      'bar baz',
      'baz',
      'qux  ',
    ])
  })
})

describe('generatePattern', () => {
  it('returns empty string for no examples', () => {
    expect(generatePattern([])).toBe('')
  })

  it('builds a pattern that matches every example', () => {
    const examples = ['cat', 'car', 'cart']
    const pattern = generatePattern(examples)
    const re = new RegExp(`^(?:${pattern})$`)
    for (const ex of examples) {
      expect(re.test(ex)).toBe(true)
    }
  })

  it('handles alternating unrelated tokens', () => {
    const pattern = generatePattern(['foo', 'bar', 'baz'])
    const re = new RegExp(`^(?:${pattern})$`)
    expect(re.test('foo')).toBe(true)
    expect(re.test('bar')).toBe(true)
    expect(re.test('baz')).toBe(true)
    expect(re.test('qux')).toBe(false)
  })
})

describe('formatLiteral and flags', () => {
  it('formats slash literals with ordered flags', () => {
    expect(formatLiteral('ab+', 'ig')).toBe('/ab+/gi')
    expect(sanitizeFlags('xyzgiig')).toBe('gi')
  })

  it('compiles valid patterns and rejects bad ones', () => {
    expect(compileRegex('a+', 'i')).toBeInstanceOf(RegExp)
    expect(compileRegex('(')).toBeNull()
    expect(compileRegex('')).toBeNull()
  })
})
