import { arrow, fmt, font } from './canvasUtils'

/* Physics demo: a body falls freely from rest. v = u + gt, with u = 0. */
export const freeFallSimulator = {
  label: 'Animation of a ball falling freely, with its speed growing every second',
  controls: [
    { key: 'mass', label: 'Mass', min: 1, max: 10, step: 1, format: (v) => `${v} kg` },
    { key: 'gravity', label: 'Gravity (g)', min: 1, max: 20, step: 1, format: (v) => `${v} m/s²` },
    { key: 'time', label: 'Time of fall', min: 0.5, max: 6, step: 0.5, format: (v) => `${v} s` },
  ],
  initial: { mass: 2, gravity: 10, time: 3 },
  duration: 2500,
  playLabel: 'Drop it',

  // progress is null when not animating, otherwise 0 to 1
  compute(values, progress) {
    const t = progress === null ? values.time : progress * values.time
    return {
      ...values,
      t,
      velocity: values.gravity * t,
      distance: 0.5 * values.gravity * t * t,
    }
  },

  results: (live) => [
    { label: 'Starting speed (u)', value: '0 m/s' },
    { label: 'Time (t)', value: `${fmt(live.t)} s` },
    { label: 'Speed (v = u + gt)', value: `${fmt(live.velocity)} m/s` },
    { label: 'Distance fallen', value: `${fmt(live.distance)} m` },
  ],

  note: (values) => {
    const v = values.gravity * values.time
    const base = `v = u + gt = 0 + (${values.gravity} × ${values.time}) = ${fmt(v)} m/s. Change the mass and the speed stays the same.`
    return values.gravity === 10 && values.time === 3 ? `${base} This matches option C.` : base
  },

  draw(ctx, { width, height, colors }, live) {
    const { gravity, time, mass, t, velocity } = live
    const top = 36
    const bottom = height - 54
    const ground = height - 28
    const trackX = width * 0.28

    const total = 0.5 * gravity * time * time
    const scale = total > 0 ? (bottom - top) / total : 0
    const yAt = (s) => top + 0.5 * gravity * s * s * scale

    // Ground
    ctx.strokeStyle = colors.muted
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(24, ground)
    ctx.lineTo(width - 24, ground)
    ctx.stroke()

    // Track
    ctx.setLineDash([6, 6])
    ctx.strokeStyle = colors.border
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(trackX, top)
    ctx.lineTo(trackX, bottom)
    ctx.stroke()
    ctx.setLineDash([])

    // Position after each second
    ctx.font = font(colors, 20, 600)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const marks = []
    for (let s = 0; s <= time; s += 1) marks.push(s)
    if (time % 1 !== 0) marks.push(time)
    marks.forEach((s) => {
      const y = yAt(s)
      ctx.fillStyle = colors.muted
      ctx.beginPath()
      ctx.arc(trackX, y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillText(`${fmt(s)} s`, trackX - 16, y)
    })

    // The ball
    const y = yAt(t)
    const radius = 8 + mass * 1.2
    ctx.fillStyle = colors.primary
    ctx.beginPath()
    ctx.arc(trackX, y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Speed arrow, as long as the speed is
    const maxSpeed = gravity * time
    const arrowStart = trackX + radius + 12
    const length = maxSpeed > 0 ? (velocity / maxSpeed) * (width * 0.45) : 0
    arrow(ctx, arrowStart, y, length, colors.warning)

    ctx.fillStyle = colors.text
    ctx.font = font(colors, 22)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(`${fmt(velocity)} m/s`, arrowStart, Math.max(y - 14, 22))
  },
}
