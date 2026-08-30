<script setup>
defineProps({
  message: { type: String, required: true },
})
</script>

<template>
  <div
    class="mb-4 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink"
    role="status"
    aria-live="polite"
  >
    {{ message }}
  </div>
</template>
