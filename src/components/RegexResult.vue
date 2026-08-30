<script setup>
import { FLAG_OPTIONS } from '../constants.js'

defineProps({
  literal: { type: String, required: true },
  pattern: { type: String, required: true },
  flags: { type: String, required: true },
  copyLabel: { type: String, required: true },
})

defineEmits(['toggle-flag', 'copy-literal', 'copy-pattern', 'select-field'])
</script>

<template>
  <section class="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
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
          @click="$emit('toggle-flag', opt.id)"
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
        @focus="$emit('select-field', $event)"
        @click="$emit('select-field', $event)"
      />
      <button
        type="button"
        class="btn btn-secondary shrink-0 sm:min-w-[5.5rem]"
        title="Copy full /pattern/flags literal"
        @click="$emit('copy-literal')"
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
        @click="$emit('copy-pattern')"
      >
        Copy pattern
      </button>
    </div>
  </section>
</template>
