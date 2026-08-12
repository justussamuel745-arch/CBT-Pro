import  { useState } from "react";
import { Link } from 'react-router';
import { subjectsData } from '../../scripts/data/subjectsData';
import { formatName } from '../../scripts/utilis/formatName';
import { authStore } from '../../stores/authStore';
import './Subjects.css';

export default function Subjects(){
  const isActivated = authStore(state => state.isActivated)
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
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div id="study-container">
          <div className="breadcrumb">
            <Link to="/">Dashboard</Link> / Study
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
            <div className="simulator-eyebrow">
              <i className="fa-solid fa-desktop"></i> Official JAMB Format
            </div>
            <h2>JAMB CBT Simulator</h2>
            <p>
              180 questions across 4 subjects in 120 minutes, exactly like exam day. Practice under the exact same rules and get comfortable with the real interface.
            </p>
            <div className="simulator-stats">
              <div className="stat">
                <div className="stat-icon"><i className="fa-solid fa-layer-group"></i></div>
                <div>
                  <span className="stat-value">15,000+</span>
                  <span className="stat-label">Questions</span>
                </div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <div className="stat-icon"><i className="fa-solid fa-book"></i></div>
                <div>
                  <span className="stat-value">4 Subjects</span>
                  <span className="stat-label">Per Exam</span>
                </div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <div className="stat-icon"><i className="fa-solid fa-clock"></i></div>
                <div>
                  <span className="stat-value">120 Min</span>
                  <span className="stat-label">Timer</span>
                </div>
              </div>
            </div>
            <Link to="/simulator" className="btn-white">
              <i className="fa-solid fa-play"></i> Launch Full Simulator
            </Link>
          </div>

          {/* Mock CBT exam-screen visual */}
          <div className="simulator-mock">
            <div className="simulator-mock-bar">
              <span className="simulator-mock-dot"></span>
              <span className="simulator-mock-dot"></span>
              <span className="simulator-mock-dot"></span>
              <span className="simulator-mock-timer"><i className="fa-solid fa-stopwatch"></i> 01:58:12</span>
            </div>
            <div className="simulator-mock-body">
              <div className="simulator-mock-qline"></div>
              <div className="simulator-mock-qline short"></div>
              <div style={{ height: '0.85rem' }}></div>
              <div className="simulator-mock-option selected">
                <span className="simulator-mock-radio"></span>
                <span className="simulator-mock-optline"></span>
              </div>
              <div className="simulator-mock-option">
                <span className="simulator-mock-radio"></span>
                <span className="simulator-mock-optline"></span>
              </div>
              <div className="simulator-mock-option">
                <span className="simulator-mock-radio"></span>
                <span className="simulator-mock-optline"></span>
              </div>
              <div className="simulator-mock-option">
                <span className="simulator-mock-radio"></span>
                <span className="simulator-mock-optline"></span>
              </div>
            </div>
          </div>
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
                to={`/study/config?id=${subject.id}`}
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

    </>
  );
};
