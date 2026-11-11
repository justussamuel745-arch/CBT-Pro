import { Reveal } from './Reveal'

/* Title + optional subtitle pair used at the top of every home section. */
export function SectionHeader({ title, sub, left = false }) {
  return (
    <>
      <Reveal as="h2" className={`home-section-title${left ? ' home-section-title-left' : ''}`}>
        {title}
      </Reveal>
      {sub && (
        <Reveal as="p" index={1} className="home-section-sub">
          {sub}
        </Reveal>
      )}
    </>
  )
}
