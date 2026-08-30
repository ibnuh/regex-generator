<script setup>
defineProps({
  // reserved for future branding bits
})

defineEmits(['sample'])
</script>

<template>
  <header class="mb-10 flex items-start justify-between gap-6">
    <div>
      <p class="mb-2 text-sm text-muted">ibnuhx.com</p>
      <h1 class="text-2xl font-medium tracking-tight sm:text-3xl">Regex Generator</h1>
      <p class="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
        Add the strings you want to match. Get a compact regular expression that covers all of them.
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
      <button
        type="button"
        class="btn btn-ghost"
        title="Load a small cat/car/cart example"
        @click="$emit('sample')"
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
</template>
