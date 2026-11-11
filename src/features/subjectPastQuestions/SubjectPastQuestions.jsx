import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { Footer } from '@/components/layouts/Footer'
import { PublicNav } from '@/components/layouts/PublicNav'
import { Invalid } from '@/components/feedback/Invalid'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FaqList } from '@/components/common/FaqList'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PillLinkList } from '@/components/common/PillLinkList'
import { SampleQuestion } from '@/components/common/SampleQuestion'
import { SITE_URL } from '@lib/config/app.js'
import { GUEST_PATH } from '@/lib/config/publicLinks'
import { PracticeConfigForm } from './components/PracticeConfigForm';
import { CTACard } from './components/CTACard';
import {
  TIP_ICONS, getSubjectPage, getTopicLinks, getYearLinks, subjectPath,
} from './utils/subjectPage'
import '@pages/HomePage.css' // shared section, card, FAQ and CTA styles
import '@pages/JambPastQuestions.css' // shared hero, breadcrumb and prose styles
import './SubjectPastQuestions.css'

function SubjectPage({ subject }) {
  const { name, slug } = subject
  const pageUrl = `${SITE_URL}${subjectPath(slug)}`
  const seoTitle = `${name} JAMB Past Questions and Answers | CBT Pro`
  const seoDescription = `Practice ${subject.total.toLocaleString()} ${name} JAMB past questions and answers${
    subject.firstYear ? ` from ${subject.firstYear} to ${subject.lastYear}` : ''
  }. Study by topic or year with clear explanations on CBT Pro.`

  const structuredData = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'JAMB Past Questions', item: `${SITE_URL}${GUEST_PATH}` },
          { '@type': 'ListItem', position: 3, name, item: pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: subject.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
    [subject.faqs, name, pageUrl],
  )

  const yearLinks = useMemo(() => getYearLinks(subject), [subject])

  const showGroupTitles = subject.topicGroups.length > 1

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <PublicNav />

      {/* 1. HEADER */}
      <header className="pq-hero">
        <div className="home-hero-blob home-hero-blob-1"></div>
        <div className="home-hero-blob home-hero-blob-2"></div>

        <div className="container pq-hero-inner">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'JAMB Past Questions', to: GUEST_PATH },
              { label: name },
            ]}
          />
          <h1>
            {name} <span className="text-gradient">JAMB Past Questions</span> and Answers
          </h1>
          <p className="pq-hero-lead">
            Practice {subject.total.toLocaleString()} {name} questions in the JAMB UTME style. Choose
            your topics and years, read the explanations and get ready for the real exam.
          </p>

          <div className="home-hero-stats">
            <div className="stat">
              <span className="stat-num">{subject.total.toLocaleString()}</span>
              <span className="stat-label">Practice questions</span>
            </div>
            <div className="stat">
              <span className="stat-num">{subject.topicCount}</span>
              <span className="stat-label">Topics</span>
            </div>
            <div className="stat">
              <span className="stat-num">{subject.years.length}</span>
              <span className="stat-label">Years covered</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* 2. CONFIGURATION FORM */}
        <section className="home-section container" id="practice">
          <SectionHeader
            title={`Choose your ${name} questions`}
            sub="Pick topics and years, choose how many questions to show per page, then view them."
          />

          <PracticeConfigForm subject={subject} />
        </section>

        {/* 3. CONTENT FOR GOOGLE */}
        <section className="home-section container" id="about">
          <div className="pq-prose">
            <SectionHeader title={`About JAMB ${name}`} />
            {subject.intro.map((paragraph, i) => (
              <Reveal as="p" key={i} index={i + 1}>{paragraph}</Reveal>
            ))}
          </div>
        </section>

        <section className="home-section container" id="what-jamb-tests">
          <SectionHeader
            title={`What JAMB tests in ${name}`}
            sub="The main areas the exam covers, so you know what to practice."
          />
          <ul className="sp-checklist">
            {subject.tests.map((item, i) => (
              <Reveal as="li" key={item} index={i}>
                <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                <span>{item}</span>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="home-section container" id="tips">
          <div className="trust-copy tips-copy">
            <SectionHeader title={`Tips for ${name} in JAMB`} left />
            {subject.tips.map((tip, i) => (
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

        {/* 4. TOPIC AND YEAR LISTS */}
        <section className="home-section container" id="topics">
          <SectionHeader
            title={`${name} past questions by topic`}
            sub={`${subject.topicCount} topics from the JAMB ${name} syllabus.`}
          />
          <div className={`sp-topic-groups${subject.topicGroups.length === 1 ? ' is-single' : ''}`}>
            {subject.topicGroups.map((group) => (
              <div className="sp-topic-group" key={group.title ?? 'topics'}>
                {(group.title || showGroupTitles) && (
                  <h3>
                    {group.title ?? 'Other topics'}
                    <span className="sp-topic-count">{group.topics.length}</span>
                  </h3>
                )}
                <PillLinkList
                  label={group.title ?? `${name} topics`}
                  items={getTopicLinks(subject, group.topics)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="home-section container" id="years">
          <SectionHeader
            title={`${name} past questions by year`}
            sub={`Questions from ${subject.firstYear} to ${subject.lastYear}, newest first.`}
          />
          <div className="sp-years">
            <PillLinkList label={`${name} past question years`} items={yearLinks} />
          </div>
        </section>

        {/* 5. SAMPLE QUESTIONS */}
        {subject.samples.length > 0 && (
          <section className="home-section container" id="sample-questions">
            <SectionHeader
              title={`${name} sample questions with answers`}
              sub="Try these, then open the answer to check your reasoning."
            />
            <div className="sp-samples">
              {subject.samples.map((question, i) => (
                <SampleQuestion key={question.text} number={i + 1} question={question} />
              ))}
            </div>
          </section>
        )}

        {/* 6. FAQ AND CALL TO ACTION */}
        <section className="home-section container" id="faq">
          <SectionHeader title={`${name} JAMB past questions: common questions`} />
          <FaqList items={subject.faqs} />
          <Link to="/help" className="demo-cta faq-more">
            Visit the Help Center <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </section>

        <CTACard 
          subject={name} 
          buttons={[{
            link: '#practice',
            text: 'Choose questions'
          }]}
        />
      </main>

      <Footer />
    </>
  )
}

export default function SubjectPastQuestions() {
  const { slug } = useParams()
  const subject = useMemo(() => getSubjectPage(slug), [slug])

  if (!subject) return <Invalid />
  // key resets the form when navigating from one subject to another
  return <SubjectPage key={subject.slug} subject={subject} />
}
