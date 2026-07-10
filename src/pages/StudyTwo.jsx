import { useState, useEffect, useRef, useContext } from "react";
import { useSearchParams, useNavigate, Link, Navigate } from "react-router";
import UserContext from '../context/UserContext.jsx';
import { ModalDialog, ModalCentered, CSS } from '../components/NotificationSystem'
import './StudyTwo.css';
import { subjectsData } from '../scripts/data/subjectsData.js';
import { formatName } from '../scripts/utilis/formatName.js'


const yearsList = ["2025","2024","2023","2022","2021","2020","2019","2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "1996", "1995", "1994", "1993", "1992", "1991", "1990", "1989", "1988", "1987", "1986", "1985", "1984", "1983"];


export function StudyTwo() {
  const { isActivated, setStudyConfig } = useContext(UserContext)
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const subjectId = searchParams.get("id");

  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  const subject = subjectsData.find(s => s.id === subjectId);

  const [topicsOpen, setTopicsOpen] = useState(false);
  const [yearsOpen, setYearsOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  const topicsRef = useRef(null);
  const yearsRef = useRef(null);

  /*===== Render Notification Style ======*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);

  // Reset when subject changes
  useEffect(() => {
    setSelectedTopics([]);
    setSelectedYears([]);
    setTopicsOpen(false);
    setYearsOpen(false);
  }, [subjectId]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (topicsRef.current && !topicsRef.current.contains(e.target)) setTopicsOpen(false);
      if (yearsRef.current && !yearsRef.current.contains(e.target)) setYearsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Only one dropdown open at a time
  const toggleTopics = () => {
    setTopicsOpen(!topicsOpen);
    setYearsOpen(false);
  };

  const toggleYears = () => {
    setYearsOpen(!yearsOpen);
    setTopicsOpen(false);
  };

  const handleTopicChange = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleYearChange = (year) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const handleSelectAllTopics = (e) => {
    setSelectedTopics(e.target.checked ? subject.topics : []);
  };

  const handleSelectAllYears = (e) => {
    setSelectedYears(e.target.checked ? yearsList : []);
  };

  const getTopicsLabel = () => {
    if (!subject) return "Select Topics";
    if (selectedTopics.length === 0) return "Select Topics";
    if (selectedTopics.length === subject.topics.length) return "All Topics";
    return `${selectedTopics.length} Topics`;
  };

  const getYearsLabel = () => {
    if (selectedYears.length === 0) return "Select Years";
    if (selectedYears.length === yearsList.length) return "All Years";
    return `${selectedYears.length} Years`;
  };

  function startStudy() {
    if (selectedYears.length <= 0 && selectedTopics.length <= 0) {
      setModal('config_both')
      return
    } else if (selectedYears.length <= 0) {
      setModal('config_year')
      return
    } else if (selectedTopics.length <= 0) {
      setModal('config_topic')
      return
    }
    if (!isActivated) {
      setModal('activate_app')
      return
    }
    const configuration = {
      subject: subject.name,
      years: selectedYears,
      topics: selectedTopics
    }

    setStudyConfig(configuration)
    navigate('/studymode')
  }



  if (!subject) {
    return <Navigate to="/study" />
  }

  return (
    <>
      {modal === 'activate_app' && (
        <div className="ns-overlay" onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
            <ModalDialog
              type="info"
              title="Activation Required"
              subtitle="Access Restricted • CBT Pro Policy"
              body="Per CBT Pro policy, the study page requires app activation. Activate now to begin practicing immediately."
              primaryLabel="Activate App"
              onPrimary={() => navigate('/payment')}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
      {/* NAV */}
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div id="study-two-container">
          <div className="breadcrumb mb-1">
            <Link to="/">Home</Link> / <Link to="/study">Study</Link> / <span>{formatName(subject.name)}</span>
          </div>
          <div className="subject-header">
            <div className="subject-title-group">
              <div className="subject-logo" dangerouslySetInnerHTML={{ __html: subject.icon }} />
              <div className="subject-name-wrap">
                <h1>{formatName(subject.name)}</h1>
                <div className="subject-stats">
                  <span>{subject.totalQuestions.toLocaleString()} Questions</span> • <span>{subject.topics.length} Topics</span>
                </div>
              </div>
            </div>

            <form className="dropdowns-wrapper" onSubmit={e => e.preventDefault()}>
              {/* TOPICS DROPDOWN */}
              <div className="css-dropdown" ref={topicsRef} tabIndex={0}>
                <input type="checkbox" id="topics-toggle" className="dropdown-toggle" checked={topicsOpen} readOnly />
                <label htmlFor="topics-toggle" className="dropdown-label" onClick={toggleTopics}>
                  <span id="topicsLabel">{getTopicsLabel()}</span>
                  <span className="dropdown-arrow">▼</span>
                </label>
                {topicsOpen && (
                  <div className="dropdown-menu">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="topic-select-all"
                        className="select-all"
                        checked={selectedTopics.length === subject.topics.length}
                        onChange={handleSelectAllTopics}
                      />
                      <label htmlFor="topic-select-all"><strong>Select All Topics</strong></label>
                    </div>
                    <div className="divider"></div>
                    {subject.topics.map((topic, idx) => (
                      <div className="checkbox-item" key={idx}>
                        <input
                          type="checkbox"
                          id={`topic-${idx}`}
                          name="topics"
                          value={topic}
                          className="item-checkbox"
                          checked={selectedTopics.includes(topic)}
                          onChange={() => handleTopicChange(topic)}
                        />
                        <label htmlFor={`topic-${idx}`}>{topic}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* YEARS DROPDOWN */}
              <div className="css-dropdown" ref={yearsRef} tabIndex={0}>
                <input type="checkbox" id="years-toggle" className="dropdown-toggle" checked={yearsOpen} readOnly />
                <label htmlFor="years-toggle" className="dropdown-label" onClick={toggleYears}>
                  <span id="yearsLabel">{getYearsLabel()}</span>
                  <span className="dropdown-arrow">▼</span>
                </label>
                {yearsOpen && (
                  <div className="dropdown-menu">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="year-select-all"
                        className="select-all"
                        checked={selectedYears.length === yearsList.length}
                        onChange={handleSelectAllYears}
                      />
                      <label htmlFor="year-select-all"><strong>Select All Years</strong></label>
                    </div>
                    <div className="divider"></div>
                    {yearsList.map(year => (
                      <div className="checkbox-item" key={year}>
                        <input
                          type="checkbox"
                          id={`year-${year}`}
                          name="years"
                          value={year}
                          className="item-checkbox"
                          checked={selectedYears.includes(year)}
                          onChange={() => handleYearChange(year)}
                        />
                        <label htmlFor={`year-${year}`}>{year}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <main className="study-two-main" id="study-two-container">
        <div className="study-two-card">
          <h3 className="study-two-card-title">Start Study Session</h3>
          <div className="study-two-action-grid">
            <Link to="/search.html" className="study-two-action-card">
              <div className="study-two-action-icon"><i className="fas fa-search"></i></div>
              <div className="study-two-action-title"> Search</div>
              <div className="study-two-action-desc">Search past questions quickly</div>
            </Link>
            <Link to={`/syllabus?subject=${subject.name.toLowerCase()}`} className="study-two-action-card">
              <div className="study-two-action-icon"><i className="fas fa-book-open"></i></div>
              <div className="study-two-action-title">Syllabus</div>
              <div className="study-two-action-desc">JAMB topics &amp; outline</div>
            </Link>
          </div>
          <button type="button" className="btn-primary study-two-btn" onClick={startStudy}>
            Start Study Session
          </button>
        </div>

        {modal === 'config_both' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalCentered
                type="warning"
                title="Required Information Missing"
                body="Both year and topic must be selected to save the exam configuration. Complete these fields to proceed."
                primaryLabel="Complete Form"
                onPrimary={closeModal}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
        {modal === 'config_year' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalCentered
                type="warning"
                title="Year Selection Required"
                body="Please select a year for this exam. A year must be specified to save the exam configuration."
                primaryLabel="Select Year"
                onPrimary={() => { closeModal(); setYearsOpen(true) }}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
        {modal === 'config_topic' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalCentered
                type="warning"
                title="Topic Selection Required"
                body="Please select a topic for this exam. A topic must be specified to save the exam configuration."
                primaryLabel="Select Topic"
                onPrimary={() => { closeModal(); setTopicsOpen(true) }}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}