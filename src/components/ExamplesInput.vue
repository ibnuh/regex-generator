<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, required: true },
  canAdd: { type: Boolean, required: true },
})

defineEmits(['update:modelValue', 'add', 'keydown'])

const field = ref(null)

defineExpose({
  focus: () => field.value?.focus(),
})
</script>

<template>
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
        ref="field"
        :value="modelValue"
        rows="3"
        autofocus
        spellcheck="false"
        placeholder="foo&#10;bar&#10;baz"
        class="field min-h-[5.5rem] flex-1 resize-y"
        aria-describedby="examples-hint"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown="$emit('keydown', $event)"
      />
      <button
        type="button"
        class="btn btn-primary shrink-0 sm:min-w-[5.5rem] sm:self-stretch"
        :disabled="!canAdd"
        title="Add example strings (Enter)"
        @click="$emit('add')"
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
</template>
