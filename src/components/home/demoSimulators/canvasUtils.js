/* Small helpers shared by the demo simulators' canvas drawings. */

// 30 -> "30", 4.56 -> "4.6"
export const fmt = (n) => String(Number(n.toFixed(1)))

export const font = (colors, size, weight = 700) => `${weight} ${size}px ${colors.fontFamily}`

// Horizontal arrow starting at (x, y) and pointing right
export function arrow(ctx, x, y, length, color) {
  if (length < 1) return
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + length, y)
  ctx.stroke()
  if (length > 12) {
    ctx.beginPath()
    ctx.moveTo(x + length + 8, y)
    ctx.lineTo(x + length - 4, y - 7)
    ctx.lineTo(x + length - 4, y + 7)
    ctx.closePath()
    ctx.fill()
  }
}
