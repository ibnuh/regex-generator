<script setup>
defineProps({
  modelValue: { type: String, required: true },
  matchCount: { type: Number, required: true },
  segments: { type: Array, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <section class="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="text-sm font-medium">Test against text</h2>
      <p v-if="modelValue" class="text-sm text-muted" aria-live="polite">
        {{ matchCount }} match{{ matchCount === 1 ? '' : 'es' }}
      </p>
    </div>
    <label for="test-input" class="sr-only">Sample text</label>
    <textarea
      id="test-input"
      :value="modelValue"
      rows="4"
      spellcheck="false"
      placeholder="Paste sample text to see matches highlight live"
      class="field mb-3 resize-y"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div
      v-if="modelValue"
      class="min-h-[3rem] whitespace-pre-wrap break-words rounded-lg border border-border bg-canvas px-3 py-2.5 font-mono text-sm leading-relaxed"
      aria-live="polite"
    >
      <template v-if="matchCount === 0">
        <span class="text-faint">No matches in this text.</span>
      </template>
      <template v-else>
        <template v-for="(seg, i) in segments" :key="i">
          <mark v-if="seg.type === 'match'" class="rounded-sm bg-match-bg px-0.5 text-match">{{
            seg.value
          }}</mark>
          <span v-else>{{ seg.value }}</span>
        </template>
      </template>
    </div>
  </section>
</template>
