<script setup>
import { computed, ref, watch, onMounted } from 'vue'
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
  { id: 'g', label: 'g', title: 'Global' },
  { id: 'i', label: 'i', title: 'Ignore case' },
  { id: 'm', label: 'm', title: 'Multiline' },
  { id: 's', label: 's', title: 'Dotall' },
  { id: 'u', label: 'u', title: 'Unicode' },
]

const examples = ref([])
const draft = ref('')
const flags = ref('g')
const testText = ref('')
const toast = ref('')
const copyLabel = ref('Copy')
let toastTimer = 0
let copyTimer = 0

onMounted(() => {
  const saved = loadState()
  if (!saved) return
  examples.value = saved.examples
  flags.value = sanitizeFlags(saved.flags) || 'g'
  testText.value = saved.testText
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

  if (added && skipped) showToast(`Added ${added}, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}`)
  else if (added > 1) showToast(`Added ${added} strings`)
  else if (!added && skipped) showToast(skipped === 1 ? 'Already added' : 'All were already added')
}

function removeAt(index) {
  examples.value = examples.value.filter((_, i) => i !== index)
}

function clearAll() {
  if (!examples.value.length && !testText.value && !draft.value) return
  if (!window.confirm('Clear examples, test text, and start over?')) return
  examples.value = []
  draft.value = ''
  testText.value = ''
  clearState()
  showToast('Cleared')
}

async function copyLiteral() {
  if (!literal.value) return
  try {
    await navigator.clipboard.writeText(literal.value)
    copyLabel.value = 'Copied'
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copyLabel.value = 'Copy'
    }, 1600)
  } catch {
    showToast('Could not copy')
  }
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
  }
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
      <a
        href="https://github.com/ibnuh/regex-generator"
        class="shrink-0 rounded-md px-2 py-1 text-sm text-muted transition-colors hover:bg-hover hover:text-ink"
        rel="noopener noreferrer"
        target="_blank"
      >
        GitHub
      </a>
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
      <label for="examples-input" class="mb-2 block text-sm font-medium text-ink">
        Example strings
      </label>
      <p class="mb-3 text-sm text-muted">
        One per line. Press Enter to add, Shift+Enter for a new line.
      </p>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <textarea
          id="examples-input"
          v-model="draft"
          rows="3"
          autofocus
          spellcheck="false"
          placeholder="foo&#10;bar&#10;baz"
          class="min-h-[5.5rem] w-full flex-1 resize-y rounded-lg border border-border-strong bg-canvas px-3 py-2.5 font-mono text-sm leading-relaxed text-ink placeholder:text-faint focus:border-ink/40"
          @keydown="onDraftKeydown"
        />
        <button
          type="button"
          class="h-11 shrink-0 rounded-lg bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 sm:h-auto sm:self-stretch sm:px-5"
          @click="addFromDraft"
        >
          Add
        </button>
      </div>
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
          class="rounded-md px-2 py-1 text-sm text-muted transition-colors hover:bg-hover hover:text-ink"
          @click="clearAll"
        >
          Clear all
        </button>
      </div>
      <ul class="divide-y divide-border">
        <li
          v-for="(item, index) in examples"
          :key="`${index}-${item}`"
          class="group flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <code class="min-w-0 flex-1 truncate font-mono text-sm text-ink">{{ item }}</code>
          <button
            type="button"
            class="rounded-md px-2 py-1 text-sm text-muted opacity-100 transition-colors hover:bg-hover hover:text-danger sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            :aria-label="`Remove ${item}`"
            @click="removeAt(index)"
          >
            Remove
          </button>
        </li>
      </ul>
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
            class="min-w-9 rounded-md border px-2 py-1 font-mono text-xs transition-colors"
            :class="
              flags.includes(opt.id)
                ? 'border-border-strong bg-hover text-ink'
                : 'border-border text-muted hover:bg-hover hover:text-ink'
            "
            :title="opt.title"
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
          class="w-full flex-1 rounded-lg border border-border-strong bg-canvas px-3 py-2.5 font-mono text-sm text-ink"
          aria-label="Generated regular expression"
          @focus="$event.target.select()"
        />
        <button
          type="button"
          class="h-11 shrink-0 rounded-lg border border-border-strong px-4 text-sm font-medium text-ink transition-colors hover:bg-hover sm:h-auto"
          @click="copyLiteral"
        >
          {{ copyLabel }}
        </button>
      </div>
      <p class="mt-2 font-mono text-xs text-faint">pattern only: {{ pattern }}</p>
    </section>

    <section
      v-if="literal"
      class="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-sm font-medium">Test against text</h2>
        <p v-if="testText" class="text-sm text-muted">
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
        class="mb-3 w-full resize-y rounded-lg border border-border-strong bg-canvas px-3 py-2.5 font-mono text-sm leading-relaxed text-ink placeholder:text-faint"
      />
      <div
        v-if="testText"
        class="min-h-[3rem] whitespace-pre-wrap break-words rounded-lg border border-border bg-canvas px-3 py-2.5 font-mono text-sm leading-relaxed"
        aria-live="polite"
      >
        <template v-for="(seg, i) in segments" :key="i">
          <mark
            v-if="seg.type === 'match'"
            class="rounded-sm bg-match-bg px-0.5 text-match"
            >{{ seg.value }}</mark
          >
          <span v-else>{{ seg.value }}</span>
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
