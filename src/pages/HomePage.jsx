import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { Footer } from '@/components/layouts/Footer'
import { InstallAppBanner } from '@/components/layouts/InstallAppBanner'
import { PublicNav } from '@/components/layouts/PublicNav'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FaqList } from '@/components/common/FaqList'
import { AnimatedWords } from '@/components/home/AnimatedWords'
import { DemoQuestionCard } from '@/components/home/DemoQuestionCard'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import HilltopAdsBanner from '@/components/ads/HilltopAdsBanner'
import MonetagController from '@/components/ads/MonetagController';
import { SITE_URL } from '@lib/config/app.js'
import { GUEST_PATH } from '@/lib/config/publicLinks'
import { sendReview } from '@lib/api/supportApi'
import { hilltopConfig, zonesConfig } from '@lib/config/ads.config'
import {
  NEXT_UTME_DATE, FEATURES, STEPS, SUBJECTS, UTME_FACTS, TIPS, REVIEWS, FAQS,
} from '@/lib/data/homeContent'
import './HomePage.css'

const SEO_TITLE = 'CBT Pro: Free JAMB CBT Practice, Past Questions & UTME Simulator'
const SEO_DESCRIPTION =
  'Practice JAMB past questions, take a real UTME CBT simulation, get AI explanations and track your score. Browse as a guest or sign up free.'

const daysUntil = (date) => Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

const submitReview = async (review) => sendReview(review)

/* Structured data. FAQPage matches the visible FAQ. No Review/AggregateRating
   markup on purpose: Google penalises markup for reviews that are not real. */
const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CBT Pro',
    url: SITE_URL,
    description: SEO_DESCRIPTION,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CBT Pro',
    url: SITE_URL,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  },
]

export default function HomePage() {
  const daysLeft = daysUntil(NEXT_UTME_DATE)

  return (
    <>
      <MonetagController zoneConfig={zonesConfig.homePage} />
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNav />

      <header className="home-hero" id="home">
        <div className="home-hero-blob home-hero-blob-1"></div>
        <div className="home-hero-blob home-hero-blob-2"></div>

        <div className="container home-hero-inner">
          <div className="home-hero-content">
            {daysLeft > 0 && (
              <span className="home-eyebrow">
                <i className="fa-solid fa-bolt"></i> {daysLeft} days until the next UTME
              </span>
            )}

            <h1>
              <AnimatedWords text="Turn practice into" />
              <AnimatedWords text="top scores" startDelay={140} className="text-gradient" />
            </h1>
            <p>
              Practice JAMB past questions, track your progress, and simulate the actual UTME CBT
              experience — all in one platform, free to start.
            </p>

            <div className="home-hero-actions">
              <Link to="/study" className="btn btn-primary btn-hero">Start Free Practice</Link>
              <Link to="/simulator" className="btn btn-outline btn-hero-outline">Launch Simulator</Link>
            </div>

            <Link to={GUEST_PATH} className="home-guest-link">
              No account yet? Browse past questions as a guest <i className="fa-solid fa-arrow-right"></i>
            </Link>

            <div className="home-hero-stats">
              <div className="stat"><span className="stat-num">50k+</span><span className="stat-label">Practice questions</span></div>
              <div className="stat"><span className="stat-num">17</span><span className="stat-label">JAMB subjects</span></div>
              <div className="stat"><span className="stat-num">98%</span><span className="stat-label">CBT match accuracy</span></div>
            </div>
          </div>

          <div className="home-hero-demo">
            <DemoQuestionCard />
          </div>
        </div>
      </header>

      <HilltopAdsBanner src={hilltopConfig.homeTop} />

      <main>
        <section className="home-section container" id="features">
          <SectionHeader title="Everything you need to hit 300+" sub="One platform, built around how JAMB actually works." />
          <div className="features-grid">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} index={i} className="feature-card">
                <div className="feature-icon"><i className={`fa-solid ${feature.icon}`}></i></div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-section container" id="guest">
          <Reveal className="guest-banner">
            <div>
              <h2>Just looking? Use CBT Pro as a guest</h2>
              <p>
                Browse JAMB past questions by subject and year without signing up. Create a free
                account later to save your scores and unlock the full simulator.
              </p>
            </div>
            <Link to={GUEST_PATH} className="btn btn-primary">Continue as guest</Link>
          </Reveal>
        </section>

        <section className="home-section container" id="subjects">
          <SectionHeader
            title="JAMB past questions by subject"
            sub="Pick a subject and start practicing syllabus-matched questions."
          />
          <ul className="subjects-grid">
            {SUBJECTS.map((subject, i) => (
              <Reveal as="li" key={subject.slug} index={i % 4}>
                <Link to={`${GUEST_PATH}/${subject.slug}`} className="subject-link">
                  <i className="fa-solid fa-book" aria-hidden="true"></i>
                  <span>
                    {subject.name} past questions
                    {subject.total ? <small>{subject.total.toLocaleString()} questions</small> : null}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>

        <HilltopAdsBanner src={hilltopConfig.homeCenterOne} />

        <section className="home-section home-steps-section">
          <div className="container">
            <SectionHeader title="How it works" sub="Three steps between you and exam-day confidence." />
            <div className="steps-grid">
              {STEPS.map((step, index) => (
                <Reveal key={step.title} index={index} className="step-card">
                  <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                  <div className="step-icon"><i className={`fa-solid ${step.icon}`}></i></div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HilltopAdsBanner src={hilltopConfig.homeCenterTwo} />

        <section className="home-section container" id="utme-guide">
          <SectionHeader
            title="How the JAMB UTME works"
            sub="The Unified Tertiary Matriculation Examination (UTME) is the computer-based test Nigerian candidates write for admission into universities, polytechnics and colleges of education. You sit Use of English plus three subjects related to your course."
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
            <SectionHeader title="5 ways to prepare for JAMB CBT" left />
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

        <section className="home-section container" id="about">
          <div className="trust-grid">
            <div className="trust-copy">
              <SectionHeader title="Why students trust CBT Pro" left />
              <Reveal index={1} className="trust-item">
                <i className="fa-solid fa-crosshairs"></i>
                <div>
                  <h3>Real exam experience</h3>
                  <p>A CBT system that mirrors the actual JAMB interface — same layout, timing, and question flow.</p>
                </div>
              </Reveal>
              <Reveal index={2} className="trust-item">
                <i className="fa-solid fa-magnifying-glass-chart"></i>
                <div>
                  <h3>Smart performance tracking</h3>
                  <p>Clear insight into your weak areas and time management, so you know exactly what to improve.</p>
                </div>
              </Reveal>
              <Reveal index={3} className="trust-item">
                <i className="fa-solid fa-rotate"></i>
                <div>
                  <h3>Always-updated questions</h3>
                  <p>Fresh JAMB-style and past questions, updated regularly to match the latest syllabus.</p>
                </div>
              </Reveal>
              <Link to="/about" className="demo-cta">Learn more about CBT Pro <i className="fa-solid fa-arrow-right"></i></Link>
            </div>

            <Reveal index={2} className="trust-highlight">
              <span className="trust-highlight-num">300+</span>
              <span className="trust-highlight-label">average score improvement reported by consistent users</span>
            </Reveal>
          </div>
        </section>

        <ReviewsSection reviews={REVIEWS} onSubmit={submitReview} />

        <section className="home-section container" id="faq">
          <SectionHeader title="Common questions" />
          <FaqList items={FAQS} />
          <Link to="/help" className="demo-cta faq-more">Visit the Help Center <i className="fa-solid fa-arrow-right"></i></Link>
        </section>

        <section className="home-section container">
          <Reveal className="cta">
            <h2>Your 300+ score starts today</h2>
            <p>Stop guessing. Start practicing. Everything you need to prepare like a top JAMB candidate.</p>
            <div className="cta-actions">
              <Link to="/auth/signup" className="btn btn-hero">Create Free Account</Link>
              <Link to={GUEST_PATH} className="btn btn-hero cta-ghost">Browse as guest</Link>
            </div>
          </Reveal>
        </section>
      </main>

      <HilltopAdsBanner src={hilltopConfig.homeBottom} />

      <InstallAppBanner />
      <Footer />
    </>
  )
}
