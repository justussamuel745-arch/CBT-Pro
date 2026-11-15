import { latexToText, parseMatrixBlocks } from '@lib/utils/latexToText'

const FONT = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// JPEG encodes several times faster than PNG on large canvases. Switch to 'image/png' if you need lossless.
const IMAGE_TYPE = 'image/jpeg'
const IMAGE_QUALITY = 0.92
const IMAGE_EXTENSION = IMAGE_TYPE === 'image/png' ? 'png' : 'jpg'
const CACHE_LIMIT = 20

// Text styles. `baseline` is the offset from the top of a line to its text baseline.
const PROMPT_STYLE = { font: `500 27px ${FONT}`, lineHeight: 42, baseline: 26 }
const OPTION_STYLE = { font: `500 24px ${FONT}`, lineHeight: 36, baseline: 25 }

// Matrix grid settings. Brackets are drawn as paths (not font glyphs) so they always join up.
const BLOCK_GAP = 8
const MATRIX_VERTICAL_PADDING = 6
const BRACKET_WIDTH = 22
const MATRIX_LAYOUT = {
  p: { left: 'paren', right: 'paren', align: 'center', gap: 28 },
  b: { left: 'square', right: 'square', align: 'center', gap: 28 },
  B: { left: 'brace', right: 'brace', align: 'center', gap: 28 },
  v: { left: 'bar', right: 'bar', align: 'center', gap: 28 },
  V: { left: 'double-bar', right: 'double-bar', align: 'center', gap: 28 },
  m: { align: 'center', gap: 28 },
  c: { left: 'brace', align: 'left', gap: 24 },
  a: { align: 'left', gap: 10 },
}

const imageCache = new Map()
let fontsReady

// DOMParser never loads images or runs handlers, unlike assigning innerHTML on a detached element.
function htmlToText(value) {
  if (!value) return ''
  return new DOMParser().parseFromString(String(value), 'text/html').body.textContent ?? ''
}

// Matrices stay as tokens here; layoutRichText turns them into drawn grids.
function markdownToText(value) {
  return htmlToText(latexToText(value, { matrices: 'blocks' }))
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(^|\s)[*_~`]+([^*_~`]+)[*_~`]+(?=\s|$)/g, '$1$2')
    .replace(/\\([\\`*_{}\[\]()#+\-.!])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function getQuestionText(question) {
  const value = question.question
  if (typeof value !== 'object' || value === null) return markdownToText(value)

  return [value.instruction, value.comprehension, value.qs]
    .filter(Boolean)
    .map(markdownToText)
    .join('\n\n')
}

// Measures each word once and tracks the running width instead of re-measuring the whole line.
function wrapText(ctx, text, maxWidth) {
  const lines = []
  const spaceWidth = ctx.measureText(' ').width

  for (const paragraph of String(text).split('\n')) {
    if (!paragraph) {
      lines.push('')
      continue
    }

    let line = ''
    let lineWidth = 0
    for (const word of paragraph.split(/\s+/)) {
      const wordWidth = ctx.measureText(word).width
      const nextWidth = line ? lineWidth + spaceWidth + wordWidth : wordWidth
      if (nextWidth <= maxWidth) {
        line = line ? `${line} ${word}` : word
        lineWidth = nextWidth
        continue
      }

      if (line) lines.push(line)
      if (wordWidth <= maxWidth) {
        line = word
        lineWidth = wordWidth
        continue
      }

      let part = ''
      for (const character of word) {
        if (part && ctx.measureText(part + character).width > maxWidth) {
          lines.push(part)
          part = character
        } else {
          part += character
        }
      }
      line = part
      lineWidth = ctx.measureText(part).width
    }
    if (line) lines.push(line)
  }
  return lines.length ? lines : ['']
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
}

/* ---------- Rich text: wrapped lines and matrix grids ---------- */

function layoutMatrix(ctx, { kind, rows }, maxWidth, style) {
  const config = MATRIX_LAYOUT[kind] ?? MATRIX_LAYOUT.m
  ctx.font = style.font

  const widths = rows.map((row) => row.map((cell) => ctx.measureText(cell).width))
  const columnCount = Math.max(...rows.map((row) => row.length))
  const columnWidths = Array.from({ length: columnCount }, (_, column) =>
    Math.max(...widths.map((row) => row[column] ?? 0)),
  )
  const leftPadding = config.left ? BRACKET_WIDTH : 0
  const rightPadding = config.right ? BRACKET_WIDTH : 0
  const width =
    leftPadding + rightPadding + columnWidths.reduce((sum, value) => sum + value, 0) + config.gap * (columnCount - 1)
  const naturalHeight = rows.length * style.lineHeight + MATRIX_VERTICAL_PADDING * 2
  const scale = Math.min(1, maxWidth / width) // wide matrices shrink to fit instead of overflowing

  return {
    type: 'matrix',
    rows,
    config,
    widths,
    columnWidths,
    leftPadding,
    width,
    naturalHeight,
    scale,
    height: naturalHeight * scale,
  }
}

function layoutRichText(ctx, text, maxWidth, style) {
  const segments = parseMatrixBlocks(text)
  const blocks = []

  for (const segment of segments) {
    if (segment.type === 'matrix') {
      blocks.push(layoutMatrix(ctx, segment, maxWidth, style))
      continue
    }

    // Keep paragraph breaks when the text has no matrices; otherwise trim so blocks sit flush.
    const value = segments.length > 1 ? segment.value.trim() : segment.value
    if (!value) continue
    ctx.font = style.font
    const lines = wrapText(ctx, value, maxWidth)
    blocks.push({ type: 'lines', lines, height: lines.length * style.lineHeight })
  }

  if (!blocks.length) blocks.push({ type: 'lines', lines: [''], height: style.lineHeight })
  const height = blocks.reduce((sum, block) => sum + block.height, 0) + BLOCK_GAP * (blocks.length - 1)
  return { blocks, height, style }
}

function drawBracket(ctx, type, side, edge, top, bottom) {
  const direction = side === 'left' ? 1 : -1
  const at = (offset) => edge + direction * offset
  const middle = (top + bottom) / 2
  const span = bottom - top

  ctx.beginPath()
  if (type === 'paren') {
    ctx.moveTo(at(12), top)
    ctx.bezierCurveTo(at(3), top + span * 0.25, at(3), bottom - span * 0.25, at(12), bottom)
  } else if (type === 'square') {
    ctx.moveTo(at(12), top)
    ctx.lineTo(at(4), top)
    ctx.lineTo(at(4), bottom)
    ctx.lineTo(at(12), bottom)
  } else if (type === 'bar') {
    ctx.moveTo(at(8), top)
    ctx.lineTo(at(8), bottom)
  } else if (type === 'double-bar') {
    ctx.moveTo(at(5), top)
    ctx.lineTo(at(5), bottom)
    ctx.moveTo(at(11), top)
    ctx.lineTo(at(11), bottom)
  } else if (type === 'brace') {
    const radius = 7
    ctx.moveTo(at(14), top)
    ctx.quadraticCurveTo(at(8), top, at(8), top + radius)
    ctx.lineTo(at(8), middle - radius)
    ctx.quadraticCurveTo(at(8), middle, at(2), middle)
    ctx.quadraticCurveTo(at(8), middle, at(8), middle + radius)
    ctx.lineTo(at(8), bottom - radius)
    ctx.quadraticCurveTo(at(8), bottom, at(14), bottom)
  }
  ctx.stroke()
}

function drawMatrix(ctx, block, x, y, style, colors) {
  const { rows, config, widths, columnWidths, leftPadding, width, naturalHeight, scale } = block

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.font = style.font
  ctx.fillStyle = colors.text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  let baselineY = MATRIX_VERTICAL_PADDING + style.baseline
  rows.forEach((row, rowIndex) => {
    let cellX = leftPadding
    columnWidths.forEach((columnWidth, column) => {
      const cell = row[column]
      if (cell) {
        const offset = config.align === 'left' ? 0 : (columnWidth - widths[rowIndex][column]) / 2
        ctx.fillText(cell, cellX + offset, baselineY)
      }
      cellX += columnWidth + config.gap
    })
    baselineY += style.lineHeight
  })

  ctx.strokeStyle = colors.text
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (config.left) drawBracket(ctx, config.left, 'left', 0, 3, naturalHeight - 3)
  if (config.right) drawBracket(ctx, config.right, 'right', width, 3, naturalHeight - 3)
  ctx.restore()
}

function drawRichText(ctx, layout, x, top, colors) {
  const { blocks, style } = layout
  let y = top

  for (const block of blocks) {
    if (block.type === 'matrix') {
      drawMatrix(ctx, block, x, y, style, colors)
    } else {
      ctx.font = style.font
      ctx.fillStyle = colors.text
      block.lines.forEach((line, index) => {
        ctx.fillText(line, x, y + index * style.lineHeight + style.baseline)
      })
    }
    y += block.height + BLOCK_GAP
  }
}

/* ---------- Image generation ---------- */

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not generate the question image'))
      },
      IMAGE_TYPE,
      IMAGE_QUALITY,
    )
  })
}

// Measuring with a fallback font and drawing with Inter gives wrong line breaks, so wait for it once.
function loadFonts() {
  fontsReady ??= Promise.all(
    ['500 24px', '700 18px', '800 23px'].map((font) => document.fonts.load(`${font} Inter`)),
  ).catch(() => {})
  return fontsReady
}

function readColors() {
  const rootStyle = getComputedStyle(document.documentElement)
  const token = (name, fallback) => rootStyle.getPropertyValue(name).trim() || fallback
  return {
    page: token('--bg', '#f8fafc'),
    card: token('--card', '#ffffff'),
    text: token('--text', '#0f172a'),
    muted: token('--text-muted', '#64748b'),
    border: token('--border', '#e2e8f0'),
    primary: token('--primary', '#4f46e5'),
    primaryLight: token('--primary-light', '#eef2ff'),
  }
}

async function renderQuestionShareImage({ question, subject, number }, colors) {
  await loadFonts()

  const scale = 2
  const width = 1000
  const outer = 36
  const cardX = outer
  const cardWidth = width - outer * 2
  const inner = 52
  const contentX = cardX + inner
  const contentWidth = cardWidth - inner * 2
  const optionTextOffset = 64
  const optionTextWidth = contentWidth - 92
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser')

  ctx.font = `700 24px ${FONT}`
  const metadata = [
    subject,
    question.year ? `JAMB ${question.year}` : '',
    question.topic ?? '',
    number ? `Question ${number}` : '',
  ].filter(Boolean)
  const pills = []
  let pillX = contentX
  let pillY = 142
  for (const label of metadata) {
    const pillWidth = ctx.measureText(label).width + 36
    if (pillX + pillWidth > contentX + contentWidth) {
      pillX = contentX
      pillY += 54
    }
    pills.push({ label, x: pillX, y: pillY, width: pillWidth })
    pillX += pillWidth + 12
  }

  const y = pillY + 68
  const prompt = getQuestionText(question)
  const promptLayout = layoutRichText(ctx, prompt || 'Question text unavailable.', contentWidth, PROMPT_STYLE)
  const optionLayouts = []
  let optionY = y + promptLayout.height + 34
  const options = question.options ?? []
  for (const option of options) {
    const text = layoutRichText(ctx, markdownToText(option.option), optionTextWidth, OPTION_STYLE)
    const optionHeight = Math.max(76, text.height + 34)
    optionLayouts.push({ option, text, y: optionY, height: optionHeight })
    optionY += optionHeight + 16
  }

  const cardHeight = optionY - 16 + 46
  const height = cardHeight + outer * 2
  canvas.height = height * scale // resets the context state, so scale and fonts are applied below
  ctx.scale(scale, scale)

  ctx.fillStyle = colors.page
  ctx.fillRect(0, 0, width, height)
  roundedRect(ctx, cardX, outer, cardWidth, cardHeight, 24)
  ctx.fillStyle = colors.card
  ctx.fill()
  ctx.strokeStyle = colors.border
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = colors.primary
  ctx.font = `800 23px ${FONT}`
  ctx.fillText('CBT Pro  ·  JAMB Past Questions', contentX, outer + 48)

  for (const pill of pills) {
    roundedRect(ctx, pill.x, pill.y, pill.width, 40, 20)
    ctx.fillStyle = colors.primaryLight
    ctx.fill()
    ctx.fillStyle = colors.primary
    ctx.font = `700 18px ${FONT}`
    ctx.textBaseline = 'middle'
    ctx.fillText(pill.label, pill.x + 18, pill.y + 20)
    ctx.textBaseline = 'alphabetic'
  }

  drawRichText(ctx, promptLayout, contentX, y, colors)

  for (const layout of optionLayouts) {
    roundedRect(ctx, contentX, layout.y, contentWidth, layout.height, 14)
    ctx.fillStyle = colors.page
    ctx.fill()
    ctx.strokeStyle = colors.border
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(contentX + 30, layout.y + layout.height / 2, 18, 0, Math.PI * 2)
    ctx.fillStyle = colors.card
    ctx.fill()
    ctx.strokeStyle = colors.border
    ctx.stroke()
    ctx.fillStyle = colors.text
    ctx.font = `800 17px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(layout.option.id).toUpperCase(), contentX + 30, layout.y + layout.height / 2)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    const textTop = layout.y + (layout.height - layout.text.height) / 2
    drawRichText(ctx, layout.text, contentX + optionTextOffset, textTop, colors)
  }

  const blob = await canvasToBlob(canvas)
  return new File([blob], `cbt-pro-question-${question.id}.${IMAGE_EXTENSION}`, { type: IMAGE_TYPE })
}

// Results are cached per question and theme, so a repeat share (or a prefetch) returns instantly.
export function createQuestionShareImage(args) {
  const colors = readColors()
  const key = [args.question.id, args.subject, args.number, ...Object.values(colors)].join('|')

  let pending = imageCache.get(key)
  if (!pending) {
    pending = renderQuestionShareImage(args, colors).catch((error) => {
      imageCache.delete(key)
      throw error
    })
    imageCache.set(key, pending)
    if (imageCache.size > CACHE_LIMIT) imageCache.delete(imageCache.keys().next().value)
  }
  return pending
}

// Call when the user is about to share (e.g. when the share menu opens) so the image is ready on tap.
export function prefetchQuestionShareImage(args) {
  createQuestionShareImage(args).catch(() => {})
}
