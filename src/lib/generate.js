import regexgen from 'regexgen'

/**
 * Build a RegExp source string from unique example strings.
 * Returns an empty string when there are no examples.
 */
export function generatePattern(examples) {
  const unique = normalizeExamples(examples)
  if (!unique.length) return ''
  return regexgen(unique).source
}

/**
 * Build a full slash-delimited regex literal, e.g. /foo|bar/gi
 */
export function formatLiteral(pattern, flags = '') {
  if (!pattern) return ''
  return `/${pattern}/${sanitizeFlags(flags)}`
}

export function normalizeExamples(examples) {
  if (!Array.isArray(examples)) return []
  const seen = new Set()
  const out = []
  for (const raw of examples) {
    if (typeof raw !== 'string') continue
    const value = raw
    if (!value.length) continue
    if (seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

export function splitInputLines(text) {
  if (typeof text !== 'string' || !text.length) return []
  // Keep internal and trailing spaces; only drop blank lines.
  return text.split(/\r?\n/).filter((line) => line.length > 0)
}

// Sticky (y) and indices (d) are omitted from the UI on purpose.
const FLAG_ORDER = ['g', 'i', 'm', 's', 'u']

export function sanitizeFlags(flags) {
  if (typeof flags !== 'string' || !flags) return ''
  const set = new Set()
  for (const ch of flags) {
    if (FLAG_ORDER.includes(ch)) set.add(ch)
  }
  return FLAG_ORDER.filter((f) => set.has(f)).join('')
}

export function compileRegex(pattern, flags = '') {
  if (!pattern) return null
  try {
    return new RegExp(pattern, sanitizeFlags(flags))
  } catch {
    return null
  }
}
