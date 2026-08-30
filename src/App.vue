<script setup>
import { ref } from 'vue'
import { useRegexSession } from './composables/useRegexSession.js'
import AppHeader from './components/AppHeader.vue'
import ToastBanner from './components/ToastBanner.vue'
import ExamplesInput from './components/ExamplesInput.vue'
import ExamplesList from './components/ExamplesList.vue'
import RegexResult from './components/RegexResult.vue'
import MatchTester from './components/MatchTester.vue'

const examplesInput = ref(null)

const {
  examples,
  draft,
  flags,
  testText,
  toast,
  copyLabel,
  canAdd,
  pattern,
  literal,
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
} = useRegexSession({
  focusDraft: () => examplesInput.value?.focus(),
})
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
    <AppHeader @sample="loadSample" />

    <ToastBanner v-if="toast" :message="toast" />

    <ExamplesInput
      ref="examplesInput"
      v-model="draft"
      :can-add="canAdd"
      @add="addFromDraft"
      @keydown="onDraftKeydown"
    />

    <ExamplesList
      :examples="examples"
      @clear="clearAll"
      @remove="removeAt"
      @sample="loadSample"
    />

    <RegexResult
      v-if="literal"
      :literal="literal"
      :pattern="pattern"
      :flags="flags"
      :copy-label="copyLabel"
      @toggle-flag="toggleFlag"
      @copy-literal="copyLiteral"
      @copy-pattern="copyPatternOnly"
      @select-field="selectField"
    />

    <MatchTester
      v-if="literal"
      v-model="testText"
      :match-count="matchCount"
      :segments="segments"
    />

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
