import { useState, useContext } from "react";
import { Link } from 'react-router';
import UserContext from '../context/UserContext';
import { Menu } from '../components/Menu';
import { url } from '../scripts/utilis/url';
import { InstallAppBanner } from '../components/InstallAppBanner';
import "./Dashboard.css";

const DASHBOARD_CARDS = [
  {
    icon: "fa-book-open",
    title: "Study Mode",
    description: "Practice by subject and topic at your own pace, with no timer pressure.",
    to: "/study",
    color: "indigo",
  },
  {
    icon: "fa-file-pen",
    title: "Exam Mode",
    description: "Full timed CBT simulation that mirrors the real JAMB layout.",
    to: "/simulator",
    color: "cyan",
  },
  {
    icon: "fa-list-check",
    title: "Syllabus",
    description: "Browse the official 2027 JAMB syllabus for all 26 subjects.",
    to: "/syllabus",
    color: "amber",
  },
  {
    icon: "fa-gamepad",
    title: "Educational Game",
    description: "Sharpen recall with quick, playful quiz challenges.",
    to: "#",
    color: "pink",
  },
  {
    icon: "fa-bookmark",
    title: "Bookmarks",
    description: "Revisit the questions you saved for extra review.",
    to: "/bookmark",
    color: "rose",
  },
  {
    icon: "fa-clock-rotate-left",
    title: "Test History",
    description: "Look back through your past attempts and scores.",
    to: "/history",
    color: "teal",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const { isActivated, userInfo, isAdmin } = useContext(UserContext)
  const userName = userInfo.fullName
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [imgExist, setImgExist] = useState(true)

  const showBanner = !isActivated && !bannerDismissed;

  const firstName = userName?.split(" ")[0];

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dash-page">
      {/* HEADER */}
      <header className="dash-header">
        <div className="dash-header-left">
          <button
            className="dash-menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <div className="dash-logo">CBT Pro</div>
        </div>

        <div className="dash-header-right">

          <button className="dash-avatar-btn" aria-label="Account">
            <span className="dash-avatar">
              <img 
                src={`${url}${userInfo?.profilePic}`}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  display: `${!imgExist ? 'none' : 'inline'}`
                }}
                onError={(event) => setImgExist(false) }
              />
              {!imgExist && initials }
            </span>
          </button>
        </div>
        
        <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} isAdmin={isAdmin} />
      </header>

      {/* MAIN */}
      <main className="dash-main">
        <div className="dash-container">
          {showBanner && (
            <div className="dash-banner">
              <button
                className="dash-banner-close"
                aria-label="Dismiss"
                onClick={() => setBannerDismissed(true)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
              <div className="dash-banner-icon">
                <i className="fa-solid fa-lock"></i>
              </div>
              <div className="dash-banner-text">
                <strong>Complete Your Account Activation</strong>
                <span>Your account is currently inactive. You can unlock our entire catalog of subjects, practice exam modes, and premium study tools for an annual subscription of ₦1,500.</span>
              </div>
              <Link to="/payment" className="dash-banner-btn">
                Activate now <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          )}

          <div className="dash-greeting">
            <div className="dash-greeting-text">
              <span className="dash-greeting-eyebrow">
                <i className="fa-solid fa-sun"></i> {getGreeting()}
              </span>
              <h1>Welcome back, {firstName} 👋</h1>
              <p>Explore something new today or continue your learning journey below.</p>
            </div>
            <div className="dash-greeting-icon">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
          </div>

          <div className="dash-grid">
            {DASHBOARD_CARDS.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className={`dash-card dash-card-${card.color}`}
              >
                <div className="dash-card-icon">
                  <i className={`fa-solid ${card.icon}`}></i>
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      
      <InstallAppBanner />
    </div>
  );
}
