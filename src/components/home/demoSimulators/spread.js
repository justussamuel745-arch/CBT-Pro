import { fmt, font } from './canvasUtils'

/* English demo: how widespread something is, from "rare" to "ubiquitous" (found everywhere). */
const COLUMNS = 8
const ROWS = 5
const PLACES = COLUMNS * ROWS

// A fixed shuffled order, so places fill in a scattered but repeatable pattern
const FILL_RANK = (() => {
  const order = Array.from({ length: PLACES }, (_, i) => i)
  let seed = 7
  for (let i = order.length - 1; i > 0; i -= 1) {
    seed = (seed * 16807) % 2147483647
    const j = seed % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const rank = new Array(PLACES)
  order.forEach((cell, r) => { rank[cell] = r })
  return rank
})()

const wordFor = (presence) => {
  if (presence < 20) return 'Rare'
  if (presence < 60) return 'Occasional'
  if (presence < 90) return 'Widespread'
  return 'Ubiquitous'
}

export const spreadSimulator = {
  label: 'Grid of places filling up as something becomes more widespread',
  controls: [
    { key: 'presence', label: 'Places where it is found', min: 0, max: 100, step: 5, format: (v) => `${v}%` },
  ],
  initial: { presence: 25 },
  duration: 3500,
  playLabel: 'Watch it spread',

  compute(values, progress) {
    const presence = progress === null ? values.presence : progress * 100
    const filled = Math.round((presence / 100) * PLACES)
    return { presence, filled, word: wordFor(presence), everywhere: presence >= 90 }
  },

  results: (live) => [
    { label: 'Places reached', value: `${live.filled} of ${PLACES}` },
    { label: 'Presence', value: `${Math.round(live.presence)}%` },
    { label: 'Best word', value: live.word },
    { label: 'Found everywhere?', value: live.everywhere ? 'Yes' : 'Not yet', tone: live.everywhere ? 'is-success' : '' },
  ],

  note: (values, live) =>
    live.everywhere
      ? "Found almost everywhere. That is what 'ubiquitous' means, so 'Everywhere' is the nearest meaning."
      : `Only ${live.filled} of ${PLACES} places have it, so '${live.word.toLowerCase()}' fits better. Raise the slider until it is found everywhere.`,

  draw(ctx, { width, colors }, live) {
    const { presence, filled, everywhere } = live
    const tone = everywhere ? colors.success : colors.primary

    ctx.fillStyle = tone
    ctx.font = font(colors, 26)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(`${fmt(Math.round(presence))}% of places`, width / 2, 34)

    const marginX = 40
    const stepX = (width - marginX * 2) / COLUMNS
    const startY = 82
    const stepY = 46

    for (let i = 0; i < PLACES; i += 1) {
      const column = i % COLUMNS
      const row = Math.floor(i / COLUMNS)
      const cx = marginX + stepX * column + stepX / 2
      const cy = startY + stepY * row
      const on = FILL_RANK[i] < filled

      ctx.beginPath()
      ctx.arc(cx, cy, 14, 0, Math.PI * 2)
      ctx.fillStyle = on ? tone : colors.primaryLight
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = on ? tone : colors.border
      ctx.stroke()
    }
  },
}
