import { describe, expect, it } from 'vitest'
import jsesc from '../src/shims/jsesc.js'

describe('jsesc shim', () => {
  it('passes plain ascii through', () => {
    expect(jsesc('cat')).toBe('cat')
  })

  it('escapes control characters', () => {
    expect(jsesc('a\nb\tc')).toBe('a\\nb\\tc')
  })

  it('uses es6 codepoint escapes when requested', () => {
    expect(jsesc('😀', { es6: true })).toBe('\\u{1f600}')
  })
})
