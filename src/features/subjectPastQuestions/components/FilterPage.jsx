import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { Footer } from '@/components/layouts/Footer'
import { PublicNav } from '@/components/layouts/PublicNav'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FaqList } from '@/components/common/FaqList'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PillLinkList } from '@/components/common/PillLinkList'
import { SITE_URL } from '@lib/config/app.js'
import { GUEST_PATH } from '@/lib/config/publicLinks'
import { TIP_ICONS, subjectPath } from '../utils/subjectPage'
import { readPageSize } from '../utils/questionFilters'
import { PracticeConfigForm } from './PracticeConfigForm';
import { CTACard } from './CTACard';
import { QuestionList } from './QuestionList'
import '@pages/HomePage.css' // shared section, card, FAQ and CTA styles
import '@pages/JambPastQuestions.css' // shared hero, breadcrumb and prose styles
import '../SubjectPastQuestions.css' // topic-group cards reused for the related lists
import './FilterPage.css'

/* Layout shared by the topic, year and selected-questions pages.
   `page` comes from getTopicPage / getYearPage in utils/filterPage.js. */
export function FilterPage({ page }) {
  const { subject, seo } = page
  const { name, slug } = subject
  const pageUrl = `${SITE_URL}${page.canonicalPath}`
  const [searchParams] = useSearchParams()
  const pageSize = readPageSize(searchParams)

  const structuredData = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'JAMB Past Questions', item: `${SITE_URL}${GUEST_PATH}` },
          { '@type': 'ListItem', position: 3, name, item: `${SITE_URL}${subjectPath(slug)}` },
          { '@type': 'ListItem', position: 4, name: page.breadcrumbLabel, item: pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
    [page, name, slug, pageUrl],
  )

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={pageUrl} />
        {page.noindex && <meta name="robots" content="noindex, follow" />}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <PublicNav />

      {/* HEADER */}
      <header className="pq-hero">
        <div className="home-hero-blob home-hero-blob-1"></div>
        <div className="home-hero-blob home-hero-blob-2"></div>

        <div className="container pq-hero-inner">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'JAMB Past Questions', to: GUEST_PATH },
              { label: name, to: subjectPath(slug) },
              { label: page.breadcrumbLabel },
            ]}
          />
          <h1>
            {page.heading} <span className="text-gradient">JAMB Past Questions</span> and Answers
          </h1>
          <p className="pq-hero-lead">{page.lead}</p>
        </div>
      </header>

      <main>
        {/* QUESTIONS */}
        <section className="home-section container" id="questions">
          <SectionHeader
            title={`${page.heading} questions and answers`}
            sub="Choose an answer to check it, or open the explanation first."
          />

          <details className="sp-refine" id="practice">
            <summary>Change topics, years or questions per page</summary>
            <PracticeConfigForm
              subject={subject}
              initialTopics={page.topics}
              initialYears={page.years}
              initialSize={pageSize}
            />
          </details>

          <QuestionList subject={subject} topics={page.topics} years={page.years} />
        </section>

        {/* ABOUT */}
        <section className="home-section container" id="about">
          <div className="pq-prose">
            <SectionHeader title={`About ${page.heading}`} />
            {page.about.map((paragraph, i) => (
              <Reveal as="p" key={i} index={i + 1}>{paragraph}</Reveal>
            ))}
          </div>
        </section>

        {/* TIPS */}
        <section className="home-section container" id="tips">
          <div className="trust-copy tips-copy">
            <SectionHeader title={`How to practice ${page.heading}`} left />
            {page.tips.map((tip, i) => (
              <Reveal key={tip.title} index={i} className="trust-item">
                <i className={`fa-solid ${TIP_ICONS[i % TIP_ICONS.length]}`} aria-hidden="true"></i>
                <div>
                  <h3>{tip.title}</h3>
                  <p>{tip.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* RELATED LINKS */}
        <section className="home-section container" id="related">
          <SectionHeader title={`More ${name} past questions`} />
          <div className={`sp-topic-groups${page.related.length <= 1 ? ' is-single' : ''}`}>
            {page.related.map((block) => (
              <div className="sp-topic-group" key={block.title}>
                <h3>
                  {block.title}
                  <span className="sp-topic-count">{block.links.length}</span>
                </h3>
                <PillLinkList label={block.title} items={block.links} />
              </div>
            ))}
          </div>
          <Link to={page.moreLink.to} className="demo-cta faq-more">
            {page.moreLink.label} <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </section>

        {/* FAQ AND CTA */}
        <section className="home-section container" id="faq">
          <SectionHeader title={`${page.heading}: common questions`} />
          <FaqList items={page.faqs} />
          <Link to="/help" className="demo-cta faq-more">
            Visit the Help Center <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </section>

        <CTACard 
          subject={name}
          buttons={[{
            link: '#questions',
            text: 'Back to the questions'
          }]}
        />
      </main>

      <Footer />
    </>
  )
}
