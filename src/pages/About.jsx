import { Link } from 'react-router';
import { Footer } from '../components/Footer';
import './About.css';

export function About(){
  return (
    <>
      <title>About Us | CBT Pro</title>
      
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav> 
      
      <div className="about-page-header">
        <div id="about-container">
          <h1 className="about-page-title">About CBT Pro</h1>
          <p className="about-page-subtitle">Designed for serious JAMB preparation and top performance</p>
        </div>
      </div>
      
      <main className="about-main" id="about-container">
        <div className="about-card">
          <h2 className="about-section-title">
            <i className="fa-solid fa-bullseye"></i>
            Our Mission
          </h2>
          <p className="about-section-text">
            Our mission is to make exam preparation more focused, structured, and accessible for every student. We aim to remove the confusion and guesswork that often comes with studying by providing a smart CBT environment that mirrors real exam conditions. Every feature is designed to help learners practice with purpose and build confidence step by step.
          </p>
          <p className="about-section-text">
            We are committed to combining simplicity with intelligence. By offering well-organized practice tools, adaptive learning support, and realistic test simulations, we help students identify their strengths and improve their weak areas efficiently. Our goal is not just to help users pass exams, but to help them understand how to think and perform under real exam pressure.
          </p>
          <p className="about-section-text">
            Ultimately, we believe every student deserves a fair chance to succeed regardless of background or resources. Our platform is built to be a reliable study companion that encourages consistency, discipline, and progress. We are shaping a generation of learners who are not just prepared for exams, but ready for excellence beyond the classroom.
          </p>
    
          <div className="about-stats-grid">
            <div className="about-stat-card">
              <div className="about-stat-number">50K+</div>
              <div className="about-stat-label">Active Students</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-number">100K+</div>
              <div className="about-stat-label">Past Questions</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-number">92%</div>
              <div className="about-stat-label">Pass Rate</div>
            </div>
          </div>
        </div>
    
        <div className="about-card">
          <h2 className="about-section-title">
            <i className="fa-solid fa-lightbulb"></i>
            Why Choose CBT Pro
          </h2>
          <div className="about-values-grid">
            <div className="about-value-card">
              <h4><i className="fa-solid fa-book"></i> Real JAMB Questions</h4>
              <p>Updated yearly with authentic past questions from 1983-2026. No outdated content.</p>
            </div>
            <div className="about-value-card">
              <h4><i className="fa-solid fa-bolt"></i> Instant Feedback</h4>
              <p>See explanations immediately after each question. Learn from mistakes fast.</p>
            </div>
            <div className="about-value-card">
              <h4><i className="fa-solid fa-chart-column"></i> Smart Analytics</h4>
              <p>Track progress by subject and topic. Know exactly what to study next.</p>
            </div>
            <div className="about-value-card">
              <h4><i className="fa-solid fa-wand-magic-sparkles"></i> clean &amp; professional</h4>
              <p>Online access ensures you always practice with the most current and accurate content.</p>
            </div>
          </div>
        </div>
    
        <div className="about-card">
          <h2 className="about-section-title">
            <i className="fa-solid fa-phone"></i>
            Contact Us
          </h2>
          <p className="about-section-text">
            Have questions? Need support? Want to partner with us? We&apos;re here to help. Reach out anytime.
          </p>
    
          <div className="about-contact-grid">
            <a href="tel:+2349055010681" className="about-contact-card">
              <div className="about-contact-icon"><i className="fa-solid fa-mobile-screen-button"></i></div>
              <div className="about-contact-info">
                <h4>Phone / WhatsApp</h4>
                <span>+234 9055010681</span>
              </div>
            </a>
    
            <a href="mailto:teamcbtpro@gmail.com" className="about-contact-card">
              <div className="about-contact-icon"><i className="fa-solid fa-envelope"></i></div>
              <div className="about-contact-info">
                <h4>Email</h4>
                <span>support@cbpro.ng</span>
              </div>
            </a>
    
            <a href="https://wa.me/09055010681" target="_blank" className="about-contact-card">
              <div className="about-contact-icon"><i className="fa-brands fa-whatsapp"></i></div>
              <div className="about-contact-info">
                <h4>WhatsApp Support</h4>
                <span>Chat with us 8am - 8pm</span>
              </div>
            </a>
    
            <div className="about-contact-card">
              <div className="about-contact-icon"><i className="fa-solid fa-location-dot"></i></div>
              <div className="about-contact-info">
                <h4>Location</h4>
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  )
}