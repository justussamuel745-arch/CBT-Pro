import { useContext } from 'react';
import { Link, useNavigate } from 'react-router'
import { Footer } from '../components/Footer';
import UserContext from '../context/UserContext.jsx';
import { subjectsData } from '../scripts/data/subjectsData.js';
import { formatName } from '../scripts/utilis/formatName';
import { InstallAppBanner } from '../components/InstallAppBanner';
import './HomePage.css'

export function HomePage() {
  const { token, isActivated, userInfo} = useContext(UserContext)
  const navigate = useNavigate()
  
  return (
    <>
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <div className="logo">CBT Pro</div>
            <div className="nav-right">
            {token ? 
              (
                <>
                  {!isActivated && <Link to="/payment" className="btn btn-outline">Activate now</Link>
                  }
                </>
              ): 
              ( <>
                  <Link to="/signin" className="btn btn-outline">Sign In</Link>
                  <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                </>
              ) 
            }
            </div>
          </div>
        </div>
      </nav>

      <header className="home-header" id="home">
        <div id="home-container">
          <h1>Turn Practice Into Top Scores</h1>
          <p>Train with thousands of real questions, track your progress, and simulate the actual exam experience - All in
            one platform</p>
          <Link to="/study" className="btn btn-hero">Start Free Practice Now</Link>
        </div>
      </header>

      <main className="home-main" id="home-container">
        <section className="home-section">
          <div className="grid grid-2">
            <div className="home-card home-simulator-card">
              <h3>CBT Exam Simulator</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Exact JAMB layout with countdown timer,
                calculator, and auto-submit. Train under real exam pressure.</p>
              <Link to='/simulator' className="btn btn-primary">Launch Simulator</Link>
            </div>

            <div className="home-card">
              <h3>Official JAMB Syllabus 2027</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Download PDF or browse online. Know what JAMB will
                test you on for each subject.</p>
              <button className="home-syllabus-btn" onClick={() => navigate('/syllabus')}>
                View Full Syllabus <span>→</span>
              </button>
            </div>
          </div>
        </section>

        <section className="home-section">
          <h2 className="home-section-title">All {subjectsData.length} JAMB UTME Subjects</h2>
          <div className="home-subjects-grid">
            {
              subjectsData.map(subject => 
                (
                  <div className="home-subject-card" key={subject.id}>
                    <div className="subject-logo margin-auto" dangerouslySetInnerHTML={{__html: subject.icon}}/>
                    <div className="subject-name">{formatName(subject.name)}</div>
                  </div>
                )
              
              )
            }
          </div>
        </section>

        <section className="home-section" id="about">
          <h2 className="home-section-title">Why Students Trust This platform</h2>
          <div className="about">
            <p><strong>Real Exam Experience:</strong> Practice with CBT system that mirrors the actual JAMB interface - Same
              layout, timing, and question flow so nothing feels new on exam day.</p>
            <br />
            <p><strong>Smart Performance Tracking:</strong> Get clear insights on your weak areas, time management and
              progress so you know exactly what to improve for higher scores.</p>
            <br />
            <p><strong>Always Updated Questions:</strong> Access fresh JAMB - style questions and past questions updated
              regularly to match the latest syllabus and exam pattern.</p>
          </div>
        </section>

        <section className="home-section" id="faq">
          <h2 className="home-section-title">Common Questions</h2>
          <details className="accordion-item">
            <summary>How accurate is this compared to real JAMB?</summary>
            <div className="accordion-content">
              98% match. We reverse-engineered the 2026 JAMB CBT software. Timer, layout, and scoring work identically. The
              only difference is our questions have explanations.
            </div>
          </details>
          <details className="accordion-item">
            <summary>Do I need to create an account before using the platform?</summary>
            <div className="accordion-content">
              Yes. You need to create a free account to use the platform. This allows you to access all features, including
              practice tests, syllabus materials, and progress tracking. Your account also saves your performance so you can
              continue learning from where you stopped anytime.
            </div>
          </details>
          <details className="accordion-item">
            <summary>Are the questions based on the official JAMB syllabus?</summary>
            <div className="accordion-content">
              Yes. All questions are carefully structured to follow the official JAMB syllabus and exam pattern. This
              ensures you are practicing exactly what is required for the exam, so you can study smarter and stay fully
              prepared for real UTME questions.
            </div>
          </details>
          <details className="accordion-item">
            <summary>Can I improve my score using this platform alone?</summary>
            <div className="accordion-content">
              Yes, you can significantly improve your score using this platform if you use it consistently. It gives you
              real CBT practice, syllabus-based questions, and performance feedback to guide your revision. However, the
              best results come when you combine it with regular study and revision of your textbooks and notes.
            </div>
          </details>
          <details className="accordion-item">
            <summary>Do I need to pay to access full questions or subjects?</summary>
            <div className="accordion-content">
              Yes. Full access requires a ₦1,500 yearly subscription. This gives you unlimited practice with all questions,
              subjects, and CBT features for an entire year. It’s an affordable plan designed to give you consistent
              preparation and full access without interruptions throughout your JAMB preparation journey.
            </div>
          </details>
          <details className="accordion-item">
            <summary>Does CBT Pro include an AI-powered tutor for explanations?</summary>
            <div className="accordion-content">
              Yes. CBT Pro includes an integrated AI Tutor designed to support your learning beyond practice questions.
              This feature is built to help you understand concepts, not just memorize answers, so you can score 300+ confidently.
            </div>
          </details>
          <details className="accordion-item">
            <summary>Can I use it on Android devices?</summary>
            <div className="accordion-content">
              Yes. The platform works smoothly on all devices, including Android phones, iPhones, tablets, and computers.
              Whether you’re at home or on the go, you can access full CBT practice anytime, anywhere without any
              limitations.
            </div>
          </details>
        </section>

        <section className="home-section">
          <div className="cta">
            <h2>Your 300+ Score Starts Today</h2>
            <p>Stop guessing. Start practicing. Everything you need to prepare like a top JAMB candidate.</p>
              <Link to="/signup" className="btn btn-hero">Create Free Account</Link> 
          </div>
        </section>
      </main>
      
      <InstallAppBanner />
      <Footer />
    </>
  )
}