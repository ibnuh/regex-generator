/**
 * Find non-overlapping matches of `regex` in `text`.
 * Returns [{ start, end, value }] sorted by start.
 */
export function findMatches(text, regex) {
  if (!regex || typeof text !== 'string' || !text.length) return []

  const flags = sanitizeForGlobal(regex.flags)
  const re = new RegExp(regex.source, flags)
  const matches = []
  let m

  while ((m = re.exec(text)) !== null) {
    const value = m[0]
    const start = m.index
    const end = start + value.length
    matches.push({ start, end, value })

    // Avoid infinite loops on zero-length matches.
    if (value.length === 0) {
      re.lastIndex = m.index + 1
      if (re.lastIndex > text.length) break
    }
  }

  return matches
}

/**
 * Split text into alternating plain / match segments for rendering.
 */
export function segmentText(text, matches) {
  if (typeof text !== 'string') return []
  if (!matches?.length) {
    return text.length ? [{ type: 'text', value: text }] : []
  }

  const segments = []
  let cursor = 0

  for (const match of matches) {
    if (match.start < cursor) continue
    if (match.start > cursor) {
      segments.push({ type: 'text', value: text.slice(cursor, match.start) })
    }
    segments.push({ type: 'match', value: text.slice(match.start, match.end) })
    cursor = match.end
  }

  if (cursor < text.length) {
    segments.push({ type: 'text', value: text.slice(cursor) })
  }

  return segments
}

function sanitizeForGlobal(flags) {
  const set = new Set(flags || '')
  set.add('g')
  return [...set].join('')
}
