const KEY = 'regex-generator:v2'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    return {
      examples: Array.isArray(data.examples)
        ? data.examples.filter((s) => typeof s === 'string')
        : [],
      flags: typeof data.flags === 'string' ? data.flags : 'g',
      testText: typeof data.testText === 'string' ? data.testText : '',
    }
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        examples: state.examples ?? [],
        flags: state.flags ?? 'g',
        testText: state.testText ?? '',
      }),
    )
  } catch {
    // ignore quota / private mode
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
