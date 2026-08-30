<script setup>
defineProps({
  examples: { type: Array, required: true },
})

defineEmits(['clear', 'remove', 'sample'])
</script>

<template>
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
        @click="$emit('clear')"
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
        <code class="min-w-0 flex-1 truncate font-mono text-sm text-ink" :title="item">{{
          item
        }}</code>
        <button
          type="button"
          class="btn btn-ghost btn-danger-ghost min-h-10 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          :aria-label="`Remove ${item}`"
          title="Remove this example"
          @click="$emit('remove', index)"
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
    <button type="button" class="btn btn-ghost mt-1 text-ink" @click="$emit('sample')">
      load a sample
    </button>
  </section>
</template>
