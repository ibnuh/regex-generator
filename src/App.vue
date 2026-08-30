<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  compileRegex,
  formatLiteral,
  generatePattern,
  sanitizeFlags,
  splitInputLines,
} from './lib/generate.js'
import { findMatches, segmentText } from './lib/match.js'
import { clearState, loadState, saveState } from './lib/storage.js'

const FLAG_OPTIONS = [
  { id: 'g', label: 'g', title: 'Global — find all matches' },
  { id: 'i', label: 'i', title: 'Ignore case' },
  { id: 'm', label: 'm', title: 'Multiline — ^ and $ per line' },
  { id: 's', label: 's', title: 'Dotall — . matches newlines' },
  { id: 'u', label: 'u', title: 'Unicode mode' },
]

const SAMPLE = {
  examples: ['cat', 'car', 'cart'],
  testText: 'the cat sat in the car near the cart',
}

const examples = ref([])
const draft = ref('')
const flags = ref('g')
const testText = ref('')
const toast = ref('')
const copyLabel = ref('Copy')
const draftEl = ref(null)
let toastTimer = 0
let copyTimer = 0

const canAdd = computed(() => splitInputLines(draft.value).length > 0)
const hasWork = computed(
  () => examples.value.length > 0 || testText.value.length > 0 || draft.value.length > 0,
)

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

const pattern = computed(() => generatePattern(examples.value))
const literal = computed(() => formatLiteral(pattern.value, flags.value))
const regex = computed(() => compileRegex(pattern.value, flags.value))

const matches = computed(() => findMatches(testText.value, regex.value))
const segments = computed(() => segmentText(testText.value, matches.value))
const matchCount = computed(() => matches.value.length)

function showToast(message) {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2400)
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

  // Keep typing flow fast.
  queueMicrotask(() => draftEl.value?.focus())
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
  queueMicrotask(() => draftEl.value?.focus())
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
    showToast('Could not copy — select the field and copy manually')
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
  // Cmd/Ctrl+Enter adds from anywhere when draft has content.
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && canAdd.value) {
    event.preventDefault()
    addFromDraft()
  }
}

function selectField(event) {
  event.target.select?.()
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
    <header class="mb-10 flex items-start justify-between gap-6">
      <div>
        <p class="mb-2 text-sm text-muted">ibnuhx.com</p>
        <h1 class="text-2xl font-medium tracking-tight sm:text-3xl">Regex Generator</h1>
        <p class="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
          Add the strings you want to match. Get a compact regular expression that covers all of
          them.
        </p>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
        <button
          type="button"
          class="btn btn-ghost"
          title="Load a small cat/car/cart example"
          @click="loadSample"
        >
          Try sample
        </button>
        <a
          href="https://github.com/ibnuh/regex-generator"
          class="btn btn-ghost"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub
        </a>
      </div>
    </header>

    <div
      v-if="toast"
      class="mb-4 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink"
      role="status"
      aria-live="polite"
    >
      {{ toast }}
    </div>

    <section class="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div class="mb-2 flex items-baseline justify-between gap-3">
        <label for="examples-input" class="block text-sm font-medium text-ink">
          Example strings
        </label>
        <span class="text-xs text-faint">Enter add · Shift+Enter newline</span>
      </div>
      <p class="mb-3 text-sm text-muted">One string per line. Duplicates are skipped.</p>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <textarea
          id="examples-input"
          ref="draftEl"
          v-model="draft"
          rows="3"
          autofocus
          spellcheck="false"
          placeholder="foo&#10;bar&#10;baz"
          class="field min-h-[5.5rem] flex-1 resize-y"
          aria-describedby="examples-hint"
          @keydown="onDraftKeydown"
        />
        <button
          type="button"
          class="btn btn-primary shrink-0 sm:min-w-[5.5rem] sm:self-stretch"
          :disabled="!canAdd"
          title="Add example strings (Enter)"
          @click="addFromDraft"
        >
          Add
        </button>
      </div>
      <p id="examples-hint" class="mt-2 text-xs text-faint">
        Tip: paste a list, or press
        <kbd class="rounded border border-border px-1 py-0.5 font-mono text-[11px]">Ctrl</kbd>
        /
        <kbd class="rounded border border-border px-1 py-0.5 font-mono text-[11px]">⌘</kbd>
        +
        <kbd class="rounded border border-border px-1 py-0.5 font-mono text-[11px]">Enter</kbd>
        from anywhere.
      </p>
    </section>

    <section
      v-if="examples.length"
      class="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-sm font-medium">
          Added
          <span class="font-normal text-muted">({{ examples.length }})</span>
        </h2>
        <button
          type="button"
          class="btn btn-ghost"
          title="Clear examples and test text"
          @click="clearAll"
        >
          Clear all
        </button>
      </div>
      <ul class="divide-y divide-border">
        <li
          v-for="(item, index) in examples"
          :key="`${index}-${item}`"
          class="group flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
        >
          <code
            class="min-w-0 flex-1 truncate font-mono text-sm text-ink"
            :title="item"
            >{{ item }}</code
          >
          <button
            type="button"
            class="btn btn-ghost btn-danger-ghost min-h-10 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            :aria-label="`Remove ${item}`"
            title="Remove this example"
            @click="removeAt(index)"
          >
            Remove
          </button>
        </li>
      </ul>
    </section>

    <section
      v-else
      class="mt-4 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-6 text-center sm:px-5"
    >
      <p class="text-sm text-muted">No examples yet. Add a few strings above, or</p>
      <button type="button" class="btn btn-ghost mt-1 text-ink" @click="loadSample">
        load a sample
      </button>
    </section>

    <section
      v-if="literal"
      class="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-sm font-medium">Generated regex</h2>
        <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Flags">
          <button
            v-for="opt in FLAG_OPTIONS"
            :key="opt.id"
            type="button"
            class="flag-chip"
            :title="opt.title"
            :aria-label="opt.title"
            :aria-pressed="flags.includes(opt.id)"
            @click="toggleFlag(opt.id)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          :value="literal"
          readonly
          spellcheck="false"
          class="field field-readonly flex-1"
          aria-label="Generated regular expression"
          title="Click to select all"
          @focus="selectField"
          @click="selectField"
        />
        <button
          type="button"
          class="btn btn-secondary shrink-0 sm:min-w-[5.5rem]"
          title="Copy full /pattern/flags literal"
          @click="copyLiteral"
        >
          {{ copyLabel }}
        </button>
      </div>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p class="min-w-0 flex-1 truncate font-mono text-xs text-faint" :title="pattern">
          pattern only: {{ pattern }}
        </p>
        <button
          type="button"
          class="btn btn-ghost min-h-8 shrink-0 text-xs"
          title="Copy pattern without slashes or flags"
          @click="copyPatternOnly"
        >
          Copy pattern
        </button>
      </div>
    </section>

    <section
      v-if="literal"
      class="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-sm font-medium">Test against text</h2>
        <p v-if="testText" class="text-sm text-muted" aria-live="polite">
          {{ matchCount }} match{{ matchCount === 1 ? '' : 'es' }}
        </p>
      </div>
      <label for="test-input" class="sr-only">Sample text</label>
      <textarea
        id="test-input"
        v-model="testText"
        rows="4"
        spellcheck="false"
        placeholder="Paste sample text to see matches highlight live"
        class="field mb-3 resize-y"
      />
      <div
        v-if="testText"
        class="min-h-[3rem] whitespace-pre-wrap break-words rounded-lg border border-border bg-canvas px-3 py-2.5 font-mono text-sm leading-relaxed"
        aria-live="polite"
      >
        <template v-if="matchCount === 0">
          <span class="text-faint">No matches in this text.</span>
        </template>
        <template v-else>
          <template v-for="(seg, i) in segments" :key="i">
            <mark
              v-if="seg.type === 'match'"
              class="rounded-sm bg-match-bg px-0.5 text-match"
              >{{ seg.value }}</mark
            >
            <span v-else>{{ seg.value }}</span>
          </template>
        </template>
      </div>
    </section>

    <footer class="mt-auto pt-12 text-sm text-faint">
      <p>
        Powered by
        <a
          class="text-muted underline-offset-2 hover:text-ink hover:underline"
          href="https://github.com/devongovett/regexgen"
          rel="noopener noreferrer"
          target="_blank"
          >regexgen</a
        >
        · MIT
      </p>
    </footer>
  </div>
</template>
