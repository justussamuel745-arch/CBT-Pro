import { Link } from 'react-router'
import './Footer.css'

export function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <h4>CBT Pro</h4>
            <p>Built by Top Scorers. Designed for Future Excellence.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <a href="#home">Home</a>
            <Link to="/about">About</Link>
            <Link to="/payment">Pricing/ Go Premium</Link>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#">AI Tutor</a>
            <Link to="/simulator">Mock Exam</Link>
            <Link to="/study">Past Questions</Link>
            <Link to="/syllabus">2027 Syllabus</Link>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#help">Help Center</a>
            <a href="mailto:teamcbtpro@gmail.com">Contact Us</a>
            <a href="#whatsapp">WhatsApp Group</a>
            <Link to="/legal">Terms &amp; Privacy</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © 2027 CBT Pro. Independent practice platform. Not affiliated with JAMB.
        </div>
      </div>
    </footer>
  )
}