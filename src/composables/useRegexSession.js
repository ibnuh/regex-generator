import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  compileRegex,
  formatLiteral,
  generatePattern,
  sanitizeFlags,
  splitInputLines,
} from '../lib/generate.js'
import { findMatches, segmentText } from '../lib/match.js'
import { clearState, loadState, saveState } from '../lib/storage.js'
import { SAMPLE } from '../constants.js'

export function useRegexSession(options = {}) {
  const examples = ref([])
  const draft = ref('')
  const flags = ref('g')
  const testText = ref('')
  const toast = ref('')
  const copyLabel = ref('Copy')

  let toastTimer = 0
  let copyTimer = 0

  const canAdd = computed(() => splitInputLines(draft.value).length > 0)
  const hasWork = computed(
    () => examples.value.length > 0 || testText.value.length > 0 || draft.value.length > 0,
  )

  const pattern = computed(() => generatePattern(examples.value))
  const literal = computed(() => formatLiteral(pattern.value, flags.value))
  const regex = computed(() => compileRegex(pattern.value, flags.value))
  const matches = computed(() => findMatches(testText.value, regex.value))
  const segments = computed(() => segmentText(testText.value, matches.value))
  const matchCount = computed(() => matches.value.length)

  onMounted(() => {
    const saved = loadState()
    if (saved) {
      examples.value = saved.examples
      flags.value = sanitizeFlags(saved.flags) || 'g'
      testText.value = saved.testText
    }
    window.addEventListener('keydown', onGlobalKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onGlobalKeydown)
    window.clearTimeout(toastTimer)
    window.clearTimeout(copyTimer)
  })

  watch(
    [examples, flags, testText],
    () => {
      saveState({
        examples: examples.value,
        flags: flags.value,
        testText: testText.value,
      })
    },
    { deep: true },
  )

  function showToast(message) {
    toast.value = message
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      toast.value = ''
    }, 2400)
  }

  function focusDraft() {
    queueMicrotask(() => options.focusDraft?.())
  }

  function addFromDraft() {
    const lines = splitInputLines(draft.value)
    if (!lines.length) return

    let added = 0
    let skipped = 0
    const next = [...examples.value]

    for (const line of lines) {
      if (next.includes(line)) {
        skipped += 1
        continue
      }
      next.push(line)
      added += 1
    }

    examples.value = next
    draft.value = ''

    if (added && skipped) {
      showToast(`Added ${added}, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}`)
    } else if (added > 1) {
      showToast(`Added ${added} strings`)
    } else if (!added && skipped) {
      showToast(skipped === 1 ? 'Already added' : 'All were already added')
    }

    focusDraft()
  }

  function removeAt(index) {
    examples.value = examples.value.filter((_, i) => i !== index)
  }

  function clearAll() {
    if (!hasWork.value) return
    if (!window.confirm('Clear examples, test text, and start over?')) return
    examples.value = []
    draft.value = ''
    testText.value = ''
    clearState()
    showToast('Cleared')
    focusDraft()
  }

  function loadSample() {
    if (hasWork.value && !window.confirm('Replace current examples and test text with a sample?')) {
      return
    }
    examples.value = [...SAMPLE.examples]
    testText.value = SAMPLE.testText
    draft.value = ''
    flags.value = 'g'
    showToast('Sample loaded')
  }

  async function copyText(text, okLabel = 'Copied') {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      copyLabel.value = okLabel
      window.clearTimeout(copyTimer)
      copyTimer = window.setTimeout(() => {
        copyLabel.value = 'Copy'
      }, 1600)
    } catch {
      showToast('Could not copy - select the field and copy manually')
    }
  }

  async function copyLiteral() {
    await copyText(literal.value, 'Copied')
  }

  async function copyPatternOnly() {
    await copyText(pattern.value, 'Pattern copied')
  }

  function toggleFlag(id) {
    const set = new Set(flags.value)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    flags.value = sanitizeFlags([...set].join(''))
  }

  function onDraftKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      addFromDraft()
      return
    }
    if (event.key === 'Escape' && draft.value) {
      event.preventDefault()
      draft.value = ''
    }
  }

  function onGlobalKeydown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && canAdd.value) {
      event.preventDefault()
      addFromDraft()
    }
  }

  function selectField(event) {
    event.target.select?.()
  }

  return {
    examples,
    draft,
    flags,
    testText,
    toast,
    copyLabel,
    canAdd,
    hasWork,
    pattern,
    literal,
    matches,
    segments,
    matchCount,
    addFromDraft,
    removeAt,
    clearAll,
    loadSample,
    copyLiteral,
    copyPatternOnly,
    toggleFlag,
    onDraftKeydown,
    selectField,
  }
}
