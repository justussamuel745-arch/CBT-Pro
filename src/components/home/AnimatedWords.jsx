/* Splits a heading into individually-animated words. Timing lives in CSS
   (.home-hero-content h1 .word); each word only gets a staggered delay. */
export function AnimatedWords({ text, startDelay = 0, className = '' }) {
  const words = text.split(' ')
  return words.map((word, i) => (
    <span
      className={`word ${className}`}
      key={`${word}-${i}`}
      style={{ animationDelay: `${startDelay + i * 70}ms` }}
    >
      {word}
      {i < words.length - 1 ? '\u00A0' : ''}
    </span>
  ))
}
