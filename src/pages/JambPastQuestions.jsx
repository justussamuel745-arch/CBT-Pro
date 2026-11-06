import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { Footer } from '@/components/layouts/Footer'
import { PublicNav } from '@/components/layouts/PublicNav'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FaqList } from '@/components/common/FaqList'
import { SITE_URL } from '@lib/config/app.js'
import { GUEST_PATH } from '@/lib/config/publicLinks'
import { UTME_FACTS, TIPS } from '@/lib/data/homeContent'
import {
  SUBJECT_LIST, TOTAL_QUESTIONS_LABEL, FILTERS, matchesFilter,
  BENEFITS, HOW_STEPS, WHY_POINTS, PAGE_FAQS,
} from '@/lib/data/pastQuestionsContent'
import './HomePage.css' // shared section, card, FAQ and CTA styles
import './JambPastQuestions.css'

const PAGE_URL = `${SITE_URL}${GUEST_PATH}`
const SEO_TITLE = 'JAMB Past Questions and Answers for All Subjects | CBT Pro'
const SEO_DESCRIPTION =
  'Practice JAMB past questions with explanations for every UTME subject. Study by topic, take timed CBT practice and track your progress with CBT Pro.'

const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'JAMB Past Questions', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'JAMB Past Questions by Subject',
    url: PAGE_URL,
    description: SEO_DESCRIPTION,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: SUBJECT_LIST.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${s.name} past questions`,
        url: `${PAGE_URL}/${s.slug}`,
      })),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PAGE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  },
]

function SubjectCard({ subject }) {
  return (
    <Link to={`${GUEST_PATH}/${subject.slug}`} className="pq-subject-card">
      <div className="pq-subject-img">
        {subject.image ? (
          <img src={subject.image} alt={`${subject.name} JAMB past questions`} loading="lazy" />
        ) : (
          <i className="fa-solid fa-book" aria-hidden="true"></i>
        )}
      </div>
      <div className="pq-subject-body">
        <h3>{subject.name}</h3>
        <span className="pq-subject-meta">
          <i className="fa-solid fa-layer-group" aria-hidden="true"></i>{' '}
          {subject.total.toLocaleString()} questions
        </span>
        <span className="pq-subject-go">
          Practice {subject.name} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </span>
      </div>
    </Link>
  )
}

export default function JambPastQuestions() {
  const [filter, setFilter] = useState('all')
  const subjects = useMemo(() => SUBJECT_LIST.filter((s) => matchesFilter(s, filter)), [filter])

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNav />

      <header className="pq-hero">
        <div className="home-hero-blob home-hero-blob-1"></div>
        <div className="home-hero-blob home-hero-blob-2"></div>

        <div className="container pq-hero-inner">
          <p className="pq-breadcrumb">
            <Link to="/">Home</Link> / JAMB Past Questions
          </p>
          <h1>
            JAMB Past Questions and Answers <span className="text-gradient">for every subject</span>
          </h1>
          <p className="pq-hero-lead">
            Practice real JAMB UTME-style questions by subject, learn from clear explanations, and walk
            into the exam knowing what to expect. Browse as a guest, or sign up free to save your progress.
          </p>

          <div className="pq-hero-actions">
            <a href="#subjects" className="btn btn-primary">Browse subjects</a>
            <Link to="/auth/signup" className="btn btn-outline btn-hero-outline">Create free account</Link>
          </div>

          <div className="home-hero-stats">
            <div className="stat">
              <span className="stat-num">{TOTAL_QUESTIONS_LABEL}</span>
              <span className="stat-label">Practice questions</span>
            </div>
            <div className="stat">
              <span className="stat-num">{SUBJECT_LIST.length}</span>
              <span className="stat-label">Subjects</span>
            </div>
            <div className="stat">
              <span className="stat-num">Free</span>
              <span className="stat-label">To browse as guest</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="home-section container" id="what-are-past-questions">
          <div className="pq-prose">
            <SectionHeader title="What are JAMB past questions?" />
            <Reveal as="p" index={1}>
              JAMB past questions are questions taken from earlier Unified Tertiary Matriculation
              Examination (UTME) papers. The UTME is the computer-based test Nigerian candidates write to
              gain admission into universities, polytechnics and colleges of education, and it covers
              Use of English plus three subjects related to your course.
            </Reveal>
            <Reveal as="p" index={2}>
              Because the exam follows the official syllabus, the same topics and question styles come
              up again and again. Working through past questions is the fastest way to see how JAMB
              tests each topic, find the areas where you lose marks, and get comfortable answering under
              time pressure.
            </Reveal>
            <Reveal as="p" index={3}>
              CBT Pro organizes its questions by subject, topic and year, and adds explanations so you
              learn the reasoning behind every answer instead of just seeing whether you were right.
            </Reveal>
          </div>
        </section>

        <section className="home-section container" id="benefits">
          <SectionHeader
            title="Why practicing past questions works"
            sub="Candidates who practice consistently go into the exam with fewer surprises."
          />
          <div className="features-grid">
            {BENEFITS.map((item, i) => (
              <Reveal key={item.title} index={i} className="feature-card">
                <div className="feature-icon"><i className={`fa-solid ${item.icon}`}></i></div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-section container" id="subjects">
          <SectionHeader
            title="JAMB past questions by subject"
            sub={`Choose from ${SUBJECT_LIST.length} subjects and start practicing syllabus-matched questions.`}
          />

          <div className="pq-filters" role="group" aria-label="Filter subjects by category">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`pq-filter${filter === f.value ? ' active' : ''}`}
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <ul className="pq-subjects">
            {subjects.map((subject, i) => (
              <Reveal as="li" key={subject.slug} index={i % 4}>
                <SubjectCard subject={subject} />
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="home-section home-steps-section" id="how-to-use">
          <div className="container">
            <SectionHeader title="How to practice with CBT Pro" sub="Three simple steps to turn past questions into higher scores." />
            <div className="steps-grid">
              {HOW_STEPS.map((step, i) => (
                <Reveal key={step.title} index={i} className="step-card">
                  <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
                  <div className="step-icon"><i className={`fa-solid ${step.icon}`}></i></div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section container" id="why-cbt-pro">
          <div className="trust-grid">
            <div className="trust-copy">
              <SectionHeader title="Why CBT Pro is built for past questions" left />
              {WHY_POINTS.map((item, i) => (
                <Reveal key={item.title} index={i + 1} className="trust-item">
                  <i className={`fa-solid ${item.icon}`}></i>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal index={2} className="trust-highlight">
              <span className="trust-highlight-num">{TOTAL_QUESTIONS_LABEL}</span>
              <span className="trust-highlight-label">
                practice questions across {SUBJECT_LIST.length} subjects
              </span>
            </Reveal>
          </div>
        </section>

        <section className="home-section container" id="utme-format">
          <SectionHeader
            title="JAMB UTME at a glance"
            sub="Know the format before you practice, so every session matches the real exam."
          />
          <div className="utme-facts">
            {UTME_FACTS.map((fact, i) => (
              <Reveal key={fact.label} index={i} className="fact-card">
                <span className="stat-num">{fact.num}</span>
                <span className="stat-label">{fact.label}</span>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-section container" id="tips">
          <div className="trust-copy tips-copy">
            <SectionHeader title="How to get the most from past questions" left />
            {TIPS.map((tip, i) => (
              <Reveal key={tip.title} index={i} className="trust-item">
                <i className={`fa-solid ${tip.icon}`}></i>
                <div>
                  <h3>{tip.title}</h3>
                  <p>{tip.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-section container" id="faq">
          <SectionHeader title="JAMB past questions: common questions" />
          <FaqList items={PAGE_FAQS} />
          <Link to="/help" className="demo-cta faq-more">Visit the Help Center <i className="fa-solid fa-arrow-right"></i></Link>
        </section>

        <section className="home-section container">
          <Reveal className="cta">
            <h2>Start practicing JAMB past questions today</h2>
            <p>Create a free account to save your scores, track your progress and unlock the full CBT simulator.</p>
            <div className="cta-actions">
              <Link to="/auth/signup" className="btn btn-hero">Create Free Account</Link>
              <a href="#subjects" className="btn btn-hero cta-ghost">Choose a subject</a>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  )
}
