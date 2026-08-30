import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../../src/App.vue'

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
)

describe('App UI', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('keeps Add disabled until there is draft text', async () => {
    const wrapper = mount(App)
    const add = wrapper.get('button[title="Add example strings (Enter)"]')
    expect(add.attributes('disabled')).toBeDefined()

    await wrapper.get('#examples-input').setValue('hello')
    expect(add.attributes('disabled')).toBeUndefined()
  })

  it('adds examples and shows a generated regex', async () => {
    const wrapper = mount(App)
    await wrapper.get('#examples-input').setValue('cat\ncar\ncart')
    await wrapper.get('button[title="Add example strings (Enter)"]').trigger('click')
    await flushPromises()

    const literal = wrapper.get('input[aria-label="Generated regular expression"]')
    expect(literal.element.value).toMatch(/^\/.+\/g$/)
    expect(wrapper.text()).toContain('Added')
    expect(wrapper.text()).toContain('(3)')
  })

  it('loads the sample set', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = mount(App)
    await wrapper.get('button[title="Load a small cat/car/cart example"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('(3)')
    expect(wrapper.get('#test-input').element.value).toContain('cat')
    const literal = wrapper.get('input[aria-label="Generated regular expression"]')
    expect(literal.element.value).toContain('ca')
  })

  it('shows no-match state in the tester', async () => {
    const wrapper = mount(App)
    await wrapper.get('#examples-input').setValue('zzz')
    await wrapper.get('button[title="Add example strings (Enter)"]').trigger('click')
    await flushPromises()

    await wrapper.get('#test-input').setValue('nothing here')
    await flushPromises()
    expect(wrapper.text()).toContain('No matches in this text.')
  })
})
