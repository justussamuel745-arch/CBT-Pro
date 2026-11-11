import { useInView } from '@/hooks/useInView'

/* Fades/slides content in once scrolled into view.
   `index` staggers siblings via the --reveal-i CSS var. */
export function Reveal({ children, index = 0, as: Tag = 'div', className = '', ...rest }) {
  const [ref, inView] = useInView()
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-i': index }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
