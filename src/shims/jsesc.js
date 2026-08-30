/**
 * Browser-safe stand-in for `jsesc`.
 *
 * regexgen only needs string escaping for Literal.toString(). The real
 * jsesc package touches Node's Buffer at module load, which breaks Vite
 * browser builds without a polyfill.
 */
export default function jsesc(value, options = {}) {
  const input = value == null ? '' : String(value)
  const es6 = Boolean(options.es6)
  let out = ''

  for (const char of input) {
    const cp = char.codePointAt(0)

    if (cp === 0x5c) {
      // backslash
      out += '\\\\'
      continue
    }
    if (cp === 0x27) {
      out += "\\'"
      continue
    }
    if (cp === 0x22) {
      out += '\\"'
      continue
    }
    if (cp === 0x0a) {
      out += '\\n'
      continue
    }
    if (cp === 0x0d) {
      out += '\\r'
      continue
    }
    if (cp === 0x09) {
      out += '\\t'
      continue
    }
    if (cp === 0x08) {
      out += '\\b'
      continue
    }
    if (cp === 0x0c) {
      out += '\\f'
      continue
    }
    if (cp === 0x0b) {
      out += '\\v'
      continue
    }

    // Printable ASCII stays as-is.
    if (cp >= 0x20 && cp <= 0x7e) {
      out += char
      continue
    }

    if (es6 && cp > 0xffff) {
      out += `\\u{${cp.toString(16)}}`
      continue
    }

    if (cp > 0xffff) {
      // Encode as UTF-16 surrogate pair escapes.
      const offset = cp - 0x10000
      const hi = 0xd800 + (offset >> 10)
      const lo = 0xdc00 + (offset & 0x3ff)
      out += `\\u${hi.toString(16).padStart(4, '0')}\\u${lo.toString(16).padStart(4, '0')}`
      continue
    }

    out += `\\u${cp.toString(16).padStart(4, '0')}`
  }

  return out
}
