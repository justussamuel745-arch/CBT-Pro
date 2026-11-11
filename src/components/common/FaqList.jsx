import { Reveal } from './Reveal'

/* Accordion list. Reuse on the Home page and the Help Center page. */
export function FaqList({ items }) {
  return items.map((faq, i) => (
    <Reveal key={faq.q} index={i} as="details" className="accordion-item">
      <summary>
        {faq.q}
        <i className="fa-solid fa-plus accordion-icon"></i>
      </summary>
      <div className="accordion-content">{faq.a}</div>
    </Reveal>
  ))
}
