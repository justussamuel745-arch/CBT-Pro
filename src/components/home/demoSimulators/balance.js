import { fmt, font } from './canvasUtils'

/* Mathematics demo: a balance scale comparing 3x − 7 with 11. It is level when x = 6. */
const RIGHT_SIDE = 11
const MAX_TILT_DEGREES = 18

export const balanceSimulator = {
  label: 'Balance scale comparing 3x minus 7 with 11, level when x is 6',
  controls: [
    { key: 'x', label: 'Value of x', min: 0, max: 10, step: 1, format: (v) => `x = ${v}` },
  ],
  initial: { x: 3 },
  duration: 4000,
  playLabel: 'Scan x from 0 to 10',

  compute(values, progress) {
    const x = progress === null ? values.x : progress * 10
    const left = 3 * x - 7
    const diff = left - RIGHT_SIDE
    return { x, left, right: RIGHT_SIDE, diff, balanced: Math.abs(diff) < 0.15 }
  },

  results: (live) => [
    { label: 'Left side (3x − 7)', value: fmt(live.left) },
    { label: 'Right side', value: String(live.right) },
    { label: 'Difference', value: fmt(live.diff) },
    {
      label: 'Balance',
      value: live.balanced ? 'Level' : live.diff > 0 ? 'Left is heavier' : 'Right is heavier',
      tone: live.balanced ? 'is-success' : '',
    },
  ],

  note: (values, live) =>
    live.balanced
      ? `3(${fmt(live.x)}) − 7 = ${RIGHT_SIDE}, so x = ${fmt(live.x)}. Both sides are equal and the beam is level.`
      : `3(${fmt(live.x)}) − 7 = ${fmt(live.left)}, which is ${live.diff > 0 ? 'more' : 'less'} than ${RIGHT_SIDE}. Change x until the beam is level.`,

  draw(ctx, { width, colors }, live) {
    const { x, left, diff, balanced } = live
    const px = width / 2
    const py = 120
    const half = 190
    const tone = balanced ? colors.success : colors.primary

    // Left heavier tips the left end down, which is a negative (anticlockwise) angle on a canvas
    const tilt = Math.max(-MAX_TILT_DEGREES, Math.min(MAX_TILT_DEGREES, diff * 1.5))
    const theta = (-tilt * Math.PI) / 180
    const ex = Math.cos(theta) * half
    const ey = Math.sin(theta) * half
    const leftEnd = { x: px - ex, y: py - ey }
    const rightEnd = { x: px + ex, y: py + ey }

    // Title
    ctx.fillStyle = tone
    ctx.font = font(colors, 26)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(`x = ${fmt(x)}`, px, 34)

    // Stand
    ctx.fillStyle = colors.border
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px - 30, 268)
    ctx.lineTo(px + 30, 268)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = colors.muted
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(px - 60, 268)
    ctx.lineTo(px + 60, 268)
    ctx.stroke()

    // Beam
    ctx.strokeStyle = tone
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(leftEnd.x, leftEnd.y)
    ctx.lineTo(rightEnd.x, rightEnd.y)
    ctx.stroke()

    // Pans and their values
    const pan = (end, label) => {
      ctx.strokeStyle = colors.muted
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(end.x - 52, end.y + 50)
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(end.x + 52, end.y + 50)
      ctx.stroke()

      ctx.fillStyle = colors.primaryLight
      ctx.strokeStyle = tone
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(end.x - 60, end.y + 50)
      ctx.quadraticCurveTo(end.x, end.y + 90, end.x + 60, end.y + 50)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = colors.text
      ctx.font = font(colors, 20)
      ctx.fillText(label, end.x, end.y - 20)
    }
    pan(leftEnd, `3x − 7 = ${fmt(left)}`)
    pan(rightEnd, String(RIGHT_SIDE))

    // Pivot
    ctx.fillStyle = colors.text
    ctx.beginPath()
    ctx.arc(px, py, 9, 0, Math.PI * 2)
    ctx.fill()
  },
}
