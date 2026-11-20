// Converts LaTeX math (as found in question text) into readable Unicode text.
// Reusable anywhere plain text is needed: canvas images, meta descriptions, share text, etc.
//
// Matrices, cases and aligned blocks have two output modes (options.matrices):
//   'inline' (default): plain text such as "[1, 2; 3, 4]", safe for any consumer.
//   'blocks': private-use tokens that parseMatrixBlocks() splits back into rows and columns,
//             so a renderer (like the question image) can draw a real grid with brackets.

const GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
  theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π',
  rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
}

const SYMBOLS = {
  times: '×', div: '÷', pm: '±', mp: '∓', cdot: '·', ast: '∗', star: '⋆',
  leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈', equiv: '≡', sim: '∼', cong: '≅',
  propto: '∝', infty: '∞', to: '→', rightarrow: '→', leftarrow: '←', leftrightarrow: '↔',
  Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', implies: '⇒', iff: '⇔', mapsto: '↦',
  angle: '∠', triangle: '△', perp: '⊥', parallel: '∥', degree: '°', circ: '°', prime: '′',
  in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', supset: '⊃', cup: '∪', cap: '∩', emptyset: '∅',
  varnothing: '∅', forall: '∀', exists: '∃', therefore: '∴', because: '∵', neg: '¬', land: '∧', lor: '∨',
  sum: '∑', prod: '∏', int: '∫', oint: '∮', partial: '∂', nabla: '∇',
  ldots: '…', cdots: '⋯', dots: '…', vdots: '⋮', ddots: '⋱',
  langle: '⟨', rangle: '⟩', lbrace: '{', rbrace: '}', lvert: '|', rvert: '|', mid: '|', vert: '|', Vert: '‖',
  lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉', quad: ' ', qquad: ' ',
}

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'cosec', 'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
  'log', 'ln', 'lg', 'exp', 'lim', 'max', 'min', 'sup', 'inf', 'det', 'gcd', 'mod', 'deg',
])

// Commands that wrap one argument whose content we simply keep.
const PASSTHROUGH = new Set([
  'text', 'textbf', 'textit', 'textrm', 'mathrm', 'mathbf', 'mathit', 'mathbb', 'mathcal', 'mathsf',
  'operatorname', 'boldsymbol', 'bm', 'mbox',
])

// Commands that take no argument and only affect layout.
const IGNORED = new Set([
  'left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'displaystyle', 'textstyle', 'limits', 'nolimits', 'hline',
])

// Commands that decorate one argument with a combining mark.
const COMBINING = { overline: '\u0305', bar: '\u0304', vec: '\u20D7', hat: '\u0302', tilde: '\u0303', dot: '\u0307' }

const SPACING = { ',': ' ', ';': ' ', ':': ' ', ' ': ' ', '!': '', '\\': ' ', '|': '‖' }

const VULGAR = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '1/8': '⅛' }

const SUP_FROM = '0123456789+-=()ni'
const SUP_TO = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ'
const SUB_FROM = '0123456789+-=()aehijklmnoprstuvx'
const SUB_TO = '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ'

// Environment kinds: p ( ), b [ ], B { }, v | |, V ‖ ‖, m plain grid, c cases, a aligned rows.
const ENVIRONMENTS = {
  matrix: 'm', smallmatrix: 'm', array: 'm', tabular: 'm',
  pmatrix: 'p', bmatrix: 'b', Bmatrix: 'B', vmatrix: 'v', Vmatrix: 'V',
  cases: 'c',
  aligned: 'a', alignedat: 'a', align: 'a', 'align*': 'a', split: 'a', eqnarray: 'a', 'eqnarray*': 'a',
  gathered: 'a', gather: 'a', 'gather*': 'a',
}
const ENVIRONMENTS_WITH_ARGUMENT = new Set(['array', 'tabular', 'alignedat'])

const INLINE_BRACKETS = {
  p: ['(', ')'], b: ['[', ']'], B: ['{', '}'], v: ['|', '|'], V: ['‖', '‖'], m: ['[', ']'], c: ['{', ''], a: ['', ''],
}

// A plain grid written as \left( \begin{matrix}..\end{matrix} \right) becomes a bracketed matrix.
const WRAPPERS = { '(': [')', 'p'], '[': [']', 'b'], '|': ['|', 'v'], '‖': ['\\|', 'V'], '{': ['\\}', 'B'] }

const TOKEN = { start: '\uE000', end: '\uE003', row: '\uE001', cell: '\uE002' }
const MATRIX_PATTERN = /\uE000([\s\S]*?)\uE003/g

const COMMAND = /\\([a-zA-Z]+|[^a-zA-Z])/y
const SIMPLE = /^[\p{L}\p{N}.°′]+$/u
const LIMIT_LIKE = /(lim|∑|∏|∫)$/
const MATH_DELIMITERS =
  /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?!\s)([^$]+?)(?<!\s)\$(?!\d)/g

const has = (object, key) => Object.hasOwn(object, key)
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const group = (text) => (SIMPLE.test(text) ? text : `(${text})`)

function mapChars(text, from, to) {
  let result = ''
  for (const character of text) {
    const index = from.indexOf(character)
    if (index < 0) return null
    result += to[index]
  }
  return result
}

function script(text, isSuperscript, afterLimitLike) {
  if (isSuperscript && (text === '°' || text === '′')) return text
  const mapped = isSuperscript
    ? mapChars(text, SUP_FROM, SUP_TO)
    : mapChars(text, SUB_FROM, SUB_TO)
  if (mapped !== null) return mapped
  if (!isSuperscript && afterLimitLike) return `(${text})`
  return `${isSuperscript ? '^' : '_'}${text.length === 1 ? text : `(${text})`}`
}

function fraction(numerator, denominator) {
  return VULGAR[`${numerator}/${denominator}`] ?? `${group(numerator)}/${group(denominator)}`
}

// Reads one argument: {group}, a \command, or a single character. Returns [content, nextIndex].
function readArg(tex, start) {
  let i = start
  while (tex[i] === ' ') i++

  if (tex[i] === '{') {
    let depth = 0
    for (let j = i; j < tex.length; j++) {
      if (tex[j] === '{') depth++
      else if (tex[j] === '}' && --depth === 0) return [tex.slice(i + 1, j), j + 1]
    }
    return [tex.slice(i + 1), tex.length]
  }

  if (tex[i] === '\\') {
    COMMAND.lastIndex = i
    const match = COMMAND.exec(tex)
    if (match) return [match[0], i + match[0].length]
  }

  return [tex[i] ?? '', i + 1]
}

// Finds the \end{environment} that matches an already-consumed \begin{environment}.
function findEnvironmentEnd(tex, from, environment) {
  const pattern = /\\(begin|end)\s*\{([^}]*)\}/g
  pattern.lastIndex = from
  let depth = 1
  let match
  while ((match = pattern.exec(tex))) {
    if (match[2] !== environment) continue
    depth += match[1] === 'begin' ? 1 : -1
    if (depth === 0) return { bodyEnd: match.index, next: match.index + match[0].length }
  }
  return { bodyEnd: tex.length, next: tex.length }
}

// Splits an environment body into rows (\\) and cells (&), ignoring separators inside {} or nested environments.
function parseEnvironmentRows(body) {
  const source = body.replace(/\\hline|\\cline\s*\{[^}]*\}/g, '')
  const rows = [[]]
  let cell = ''
  let braces = 0
  let nested = 0

  const endCell = () => {
    rows[rows.length - 1].push(cell.trim())
    cell = ''
  }

  for (let j = 0; j < source.length; j++) {
    const character = source[j]

    if (character === '\\') {
      if (source[j + 1] === '\\' && !braces && !nested) {
        endCell()
        rows.push([])
        j++
        const spacing = /^\s*\[[^\]]*\]/.exec(source.slice(j + 1)) // optional \\[6pt]
        if (spacing) j += spacing[0].length
        continue
      }
      const environment = /^\\(begin|end)\b/.exec(source.slice(j))
      if (environment) nested += environment[1] === 'begin' ? 1 : -1
      cell += character + (source[j + 1] ?? '')
      j++
      continue
    }

    if (character === '{') braces++
    else if (character === '}') braces--

    if (character === '&' && !braces && !nested) {
      endCell()
      continue
    }
    cell += character
  }
  endCell()

  return rows.filter((row) => row.some(Boolean))
}

function renderEnvironment(kind, rows, options) {
  if (!rows.length) return ''
  if (options.matrices === 'blocks') {
    return TOKEN.start + kind + rows.map((row) => row.join(TOKEN.cell)).join(TOKEN.row) + TOKEN.end
  }
  const [open, close] = INLINE_BRACKETS[kind]
  return open + rows.map((row) => row.join(kind === 'a' ? ' ' : ', ')).join('; ') + close
}

// If the text just before a plain grid ends with an opening bracket and the text after it starts with the
// matching closing one, fold them into the grid. Returns the new kind, the trimmed output and the length consumed.
function absorbDelimiters(out, rest) {
  const trimmed = out.trimEnd()
  const opener = trimmed.slice(-1)
  if (!has(WRAPPERS, opener)) return null

  const [closer, kind] = WRAPPERS[opener]
  const afterSpace = rest.replace(/^\s*(?:\\right)?\s*/, '')
  if (!afterSpace.startsWith(closer)) return null

  return { kind, out: trimmed.slice(0, -1), consumed: rest.length - afterSpace.length + closer.length }
}

export function texToText(tex, options = { matrices: 'inline' }) {
  let out = ''
  let i = 0

  while (i < tex.length) {
    const character = tex[i]

    if (character === '\\') {
      COMMAND.lastIndex = i
      const match = COMMAND.exec(tex)
      if (!match) {
        i++
        continue
      }
      i += match[0].length
      const name = match[1]

      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const [numerator, afterNumerator] = readArg(tex, i)
        const [denominator, afterDenominator] = readArg(tex, afterNumerator)
        i = afterDenominator
        out += fraction(texToText(numerator, options), texToText(denominator, options))
      } else if (name === 'sqrt') {
        let index = ''
        if (tex[i] === '[') {
          const end = tex.indexOf(']', i)
          if (end > -1) {
            index = tex.slice(i + 1, end)
            i = end + 1
          }
        }
        const [radicand, next] = readArg(tex, i)
        i = next
        const root = index === '3' ? '∛' : index === '4' ? '∜' : index ? `${texToText(index, options)}√` : '√'
        out += root + group(texToText(radicand, options))
      } else if (has(COMBINING, name)) {
        const [base, next] = readArg(tex, i)
        i = next
        out += [...texToText(base, options)].map((c) => c + COMBINING[name]).join('')
      } else if (PASSTHROUGH.has(name)) {
        const [content, next] = readArg(tex, i)
        i = next
        out += texToText(content, options)
      } else if (name === 'begin') {
        const [environment, afterName] = readArg(tex, i)
        i = afterName
        if (!has(ENVIRONMENTS, environment)) continue // unknown environment: ignore the wrapper only

        if (ENVIRONMENTS_WITH_ARGUMENT.has(environment)) i = readArg(tex, i)[1] // column spec like {cc}
        const { bodyEnd, next } = findEnvironmentEnd(tex, i, environment)
        const nestedOptions = { ...options, matrices: 'inline' }
        const rows = parseEnvironmentRows(tex.slice(i, bodyEnd)).map((row) =>
          row.map((cell) => texToText(cell, nestedOptions)),
        )

        let kind = ENVIRONMENTS[environment]
        i = next
        if (kind === 'm') {
          const wrapped = absorbDelimiters(out, tex.slice(next))
          if (wrapped) {
            kind = wrapped.kind
            out = wrapped.out
            i = next + wrapped.consumed
          }
        }
        out += renderEnvironment(kind, rows, options)
      } else if (name === 'end') {
        i = readArg(tex, i)[1]
      } else if (IGNORED.has(name)) {
        if ((name === 'left' || name === 'right') && tex[i] === '.') i++
      } else if (has(GREEK, name)) {
        out += GREEK[name]
      } else if (has(SYMBOLS, name)) {
        out += SYMBOLS[name]
      } else if (FUNCTIONS.has(name)) {
        out += name
        if (!/[\s(^_]/.test(tex[i] ?? ' ')) out += ' '
      } else if (!/[a-zA-Z]/.test(name)) {
        out += has(SPACING, name) ? SPACING[name] : name
      } else {
        out += name
      }
      continue
    }

    if (character === '^' || character === '_') {
      const [argument, next] = readArg(tex, i + 1)
      i = next
      out += script(texToText(argument, options), character === '^', LIMIT_LIKE.test(out))
      continue
    }

    i++
    if (character === '{' || character === '}') continue
    out += character === '~' || character === '&' ? ' ' : character
  }

  return out
}

// Replaces every math segment ($..$, $$..$$, \(..\), \[..\]) in a string with readable text.
// The converted math is HTML-escaped so a following HTML-to-text pass cannot misread "<" or "&".
export function latexToText(value, { matrices = 'inline' } = {}) {
  const source = String(value ?? '')
  if (!source.includes('\\') && !source.includes('$')) return source

  const options = { matrices }
  const converted = source.replace(MATH_DELIMITERS, (_, a, b, c, d) =>
    escapeHtml(texToText(a ?? b ?? c ?? d, options)),
  )
  if (converted !== source) return converted

  // No delimiters found: still convert text that clearly contains raw LaTeX commands.
  return /\\[a-zA-Z]{2,}/.test(source) ? texToText(source, options) : source
}

// Splits text produced with { matrices: 'blocks' } into text and matrix segments:
//   [{ type: 'text', value }, { type: 'matrix', kind, rows: [[cell, ...], ...] }]
export function parseMatrixBlocks(text) {
  const source = String(text)
  const segments = []
  let last = 0

  for (const match of source.matchAll(MATRIX_PATTERN)) {
    if (match.index > last) segments.push({ type: 'text', value: source.slice(last, match.index) })
    const payload = match[1]
    segments.push({
      type: 'matrix',
      kind: payload[0],
      rows: payload.slice(1).split(TOKEN.row).map((row) => row.split(TOKEN.cell)),
    })
    last = match.index + match[0].length
  }

  if (last < source.length) segments.push({ type: 'text', value: source.slice(last) })
  return segments
}
