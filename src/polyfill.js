import { Buffer } from 'buffer'

globalThis.Buffer = Buffer
if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis
}
