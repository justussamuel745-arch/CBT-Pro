import  { useState, useContext} from "react";
import { Link } from 'react-router';
import UserContext from '../context/UserContext.jsx'
import { Footer } from '../components/Footer';
import { Menu } from '../components/Menu';
import { subjectsData } from '../scripts/data/subjectsData.js';
import { formatName } from '../scripts/utilis/formatName.js'
import './Study.css';

export function Study(){
  const { isActivated } = useContext(UserContext)
  const [activeFilter, setActiveFilter] = useState("all");
  

  const filters = [
    { label: "All", value: "all" },
    { label: "Science", value: "science" },
    { label: "Arts", value: "arts" },
    { label: "Commercial", value: "commercial" },
  ];

  const filteredSubjects = subjectsData.filter(
    (sub) => activeFilter === "all" || sub.category.includes(activeFilter)
  );

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">
              CBT Pro
            </Link>
            <div className="nav-right">
              {!isActivated && 
                (
                  <Link to="/payment" className="btn btn-outline">
                    Activate now
                  </Link>
                ) 
              }
              <Menu />
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div id="study-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> / Study
          </div>
          <h1 className="page-title">Choose Your Subject</h1>
          <p className="page-subtitle">
            Start with Study Mode or jump into the full CBT Simulator
          </p>
        </div>
      </div>

      {/* MAIN */}
      <main id="study-container" className="study-main">
        {/* SIMULATOR HERO CARD */}
        <div className="simulator-hero">
          <div className="simulator-content">
            <h2>JAMB CBT Simulator</h2>
            <p>
              JAMB’s official format: 180 questions across 4 subjects in 120 minutes. Practice with the exact same rules.
            </p>
            <div className="simulator-stats">
              <div className="stat">
                <span className="stat-value">15,000+</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat">
                <span className="stat-value">4 Subjects</span>
                <span className="stat-label">Per Exam</span>
              </div>
              <div className="stat">
                <span className="stat-value">120 Min</span>
                <span className="stat-label">Timer</span>
              </div>
            </div>
            <Link to="/simulator" className="btn-white">
              Launch Full Simulator
            </Link>
          </div>
          <div className="simulator-icon">💻</div>
        </div>

        {/* SUBJECTS SECTION */}
        <section>
          <div className="study-section-header">
            <h2 className="study-section-title">Study Mode: Pick a Subject</h2>
            <div className="filter-tabs">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  className={`filter-btn ${activeFilter === filter.value ? "active" : ""}`}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="study-subjects-grid">
            {filteredSubjects.map((subject) => {
              return (
              <Link
                key={subject.id}
                to={`/studytwo?id=${subject.id}`}
                className="study-subject-card"
                data-category={subject.category}
              >
                <div className="subject-logo margin-auto" dangerouslySetInnerHTML={{ __html: subject.icon }} />
                <div className="subject-name">{formatName(subject.name)}</div>
                <div className="subject-meta">
                  <span className="subject-badge">{subject.totalQuestions} Qs</span>
                </div>
              </Link>
            )})}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </>
  );
};