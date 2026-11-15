const FONT = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

function htmlToText(value) {
  if (!value) return ''
  const element = document.createElement('div')
  element.innerHTML = String(value)
  return element.textContent ?? ''
}

function markdownToText(value) {
  return htmlToText(value)
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

function wrapText(ctx, text, maxWidth) {
  const lines = []
  for (const paragraph of String(text).split('\n')) {
    if (!paragraph) {
      lines.push('')
      continue
    }

    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate
        continue
      }

      if (line) lines.push(line)
      if (ctx.measureText(word).width <= maxWidth) {
        line = word
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
    }
    if (line) lines.push(line)
  }
  return lines.length ? lines : ['']
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not generate the question image'))
    }, 'image/png')
  })
}

export async function createQuestionShareImage({ question, subject, number }) {
  const scale = 2
  const width = 1000
  const outer = 36
  const cardX = outer
  const cardWidth = width - outer * 2
  const inner = 52
  const contentX = cardX + inner
  const contentWidth = cardWidth - inner * 2
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser')
  ctx.scale(scale, scale)

  const rootStyle = getComputedStyle(document.documentElement)
  const token = (name, fallback) => rootStyle.getPropertyValue(name).trim() || fallback
  const colors = {
    page: token('--bg', '#f8fafc'),
    card: token('--card', '#ffffff'),
    text: token('--text', '#0f172a'),
    muted: token('--text-muted', '#64748b'),
    border: token('--border', '#e2e8f0'),
    primary: token('--primary', '#4f46e5'),
    primaryLight: token('--primary-light', '#eef2ff'),
  }

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

  let y = pillY + 68
  const prompt = getQuestionText(question)
  ctx.font = `500 27px ${FONT}`
  const promptLines = wrapText(ctx, prompt || 'Question text unavailable.', contentWidth)
  const promptLineHeight = 42
  const promptHeight = promptLines.length * promptLineHeight
  const optionLayouts = []
  let optionY = y + promptHeight + 34
  const options = question.options ?? []
  for (const option of options) {
    const optionText = markdownToText(option.option)
    ctx.font = `500 24px ${FONT}`
    const optionLines = wrapText(ctx, optionText, contentWidth - 92)
    const optionHeight = Math.max(76, optionLines.length * 36 + 34)
    optionLayouts.push({ option, lines: optionLines, y: optionY, height: optionHeight })
    optionY += optionHeight + 16
  }

  const cardHeight = optionY - 16 + 46
  const height = cardHeight + outer * 2
  canvas.height = height * scale
  ctx.scale(scale, scale)

  // Reapply font after resizing the canvas, which resets the drawing context.
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

  ctx.fillStyle = colors.text
  ctx.font = `500 27px ${FONT}`
  promptLines.forEach((line, index) => {
    ctx.fillText(line, contentX, y + index * promptLineHeight + 26)
  })

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

    ctx.fillStyle = colors.text
    ctx.font = `500 24px ${FONT}`
    const lineHeight = 36
    const textHeight = layout.lines.length * lineHeight
    const textStartY = layout.y + (layout.height - textHeight) / 2 + 25
    layout.lines.forEach((line, index) => {
      ctx.fillText(line, contentX + 64, textStartY + index * lineHeight)
    })
  }

  return new File([await canvasToBlob(canvas)], `cbt-pro-question-${question.id}.png`, { type: 'image/png' })
}
