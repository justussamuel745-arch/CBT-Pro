import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, Link, Navigate } from "react-router";
import { ModalDialog, ModalCentered, CSS } from '../../components/NotificationSystem'
import './Config.css';
import { subjectsData } from '../../scripts/data/subjectsData.js';
import { formatName } from '../../scripts/utils/formatName.js';
import { authStore } from '../../stores/authStore';
import { studyStore } from '../../stores/studyStore';

export default function Config() {
  const isActivated = authStore(state => state.isActivated)
  const setStudyConfig = studyStore(state => state.setStudyConfig)
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
  const [topicSearch, setTopicSearch] = useState("");

  const topicsRef = useRef(null);
  const yearsRef = useRef(null);
  const topicSearchInputRef = useRef(null);

  /*===== Render Notification Style ======*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);

  // Reset when subject changes — pull years straight from the subject now
  useEffect(() => {
    const sub = subjectsData.find(sub => sub.id === subjectId);
    setSelectedTopics(sub?.topics || []);
    setSelectedYears(sub?.years || []);
    setTopicsOpen(false);
    setYearsOpen(false);
    setTopicSearch("");
  }, [subjectId]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (topicsRef.current && !topicsRef.current.contains(e.target)) {
        setTopicsOpen(false);
      }
      if (yearsRef.current && !yearsRef.current.contains(e.target)) setYearsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Only one dropdown open at a time
  const toggleTopics = () => {
    const next = !topicsOpen;
    setTopicsOpen(next);
    setYearsOpen(false);
    if (next) {
      // Focus the search box as soon as the dropdown opens
      //requestAnimationFrame(() => topicSearchInputRef.current?.focus());
    } else {
      setTopicSearch("");
    }
  };

  const openTopicsDropdown = () => {
    if (!topicsOpen) {
      setTopicsOpen(true);
      setYearsOpen(false);
      requestAnimationFrame(() => topicSearchInputRef.current?.focus());
    }
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
    setSelectedYears(e.target.checked ? subject.years : []);
  };

  const getTopicsLabel = () => {
    if (!subject) return "Select Topics";
    if (selectedTopics.length === 0) return "Select Topics";
    if (selectedTopics.length === subject.topics.length) return "All Topics";
    return `${selectedTopics.length} Topics`;
  };

  const getYearsLabel = () => {
    if (!subject) return "Select Years";
    if (selectedYears.length === 0) return "Select Years";
    if (selectedYears.length === subject.years.length) return "All Years";
    return `${selectedYears.length} Years`;
  };

  // Filtered topic list driven by the search box
  const filteredTopics = useMemo(() => {
    if (!subject) return [];
    const q = topicSearch.trim().toLowerCase();
    if (!q) return subject.topics;
    return subject.topics.filter(t => t.toLowerCase().includes(q));
  }, [subject, topicSearch]);

  const allFilteredSelected =
    filteredTopics.length > 0 && filteredTopics.every(t => selectedTopics.includes(t));

  const handleSelectAllFilteredTopics = (e) => {
    if (e.target.checked) {
      // Add every currently-filtered topic to the selection
      setSelectedTopics(prev => Array.from(new Set([...prev, ...filteredTopics])));
    } else {
      // Remove every currently-filtered topic from the selection
      setSelectedTopics(prev => prev.filter(t => !filteredTopics.includes(t)));
    }
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
    navigate('/study-simulator?mode=study')
  }

  if (!subject) {
    return <Navigate to="/study" />
  }

  // Build the action cards from this subject's own studyMaterial flags
  const actionCards = [
    subject.studyMaterial?.search && {
      key: 'search',
      to: `/study/search?subject=${subject.name}`,
      icon: 'fa-search',
      title: 'Search',
      desc: 'Search past questions quickly'
    },
    subject.studyMaterial?.syllabus && {
      key: 'syllabus',
      to: `/syllabus?subject=${subject.name.toLowerCase()}`,
      icon: 'fa-book-open',
      title: 'Syllabus',
      desc: 'JAMB topics & outline'
    },
    subject.studyMaterial?.note && {
      key: 'note',
      to: `/study/notes?subject=${subject.name.toLowerCase()}`,
      icon: 'fa-note-sticky',
      title: 'Notes',
      desc: 'Read summarized study notes'
    },
  ].filter(Boolean);

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
            <Link to="/">Dashboard</Link> / <Link to="/study">Study</Link> / <span>{formatName(subject.name)}</span>
          </div>
          <div className="subject-header">
            <div className="subject-title-group">
              <div className="subject-logo" dangerouslySetInnerHTML={{ __html: subject.icon }} />
              <div className="subject-name-wrap">
                <h1>{formatName(subject.name)}</h1>
                <div className="subject-stats">
                  <span>{subject.totalQuestions.toLocaleString()} Questions</span> • <span>{subject.topics.length} Topics</span> • <span>{subject.years.length} Years</span>
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
                    <div className="dropdown-search">
                      <i className="fas fa-search dropdown-search-icon"></i>
                      <input
                        ref={topicSearchInputRef}
                        type="text"
                        className="dropdown-search-input"
                        placeholder="Search topics..."
                        value={topicSearch}
                        onChange={(e) => setTopicSearch(e.target.value)}
                        onFocus={openTopicsDropdown}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {topicSearch && (
                        <button
                          type="button"
                          className="dropdown-search-clear"
                          onClick={() => setTopicSearch("")}
                          aria-label="Clear search"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>

                    <div className="checkbox-item select-all-row">
                      <input
                        type="checkbox"
                        id="topic-select-all"
                        className="select-all"
                        checked={allFilteredSelected}
                        onChange={handleSelectAllFilteredTopics}
                      />
                      <label htmlFor="topic-select-all">
                        <strong>{topicSearch ? "Select All Shown" : "Select All Topics"}</strong>
                      </label>
                    </div>
                    <div className="divider"></div>

                    <div className="dropdown-scroll-area">
                      {filteredTopics.length > 0 ? (
                        filteredTopics.map((topic, idx) => (
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
                        ))
                      ) : (
                        <div className="dropdown-no-results">
                          <i className="fas fa-circle-exclamation"></i>
                          No topics match "{topicSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* YEARS DROPDOWN — sourced from subject.years */}
              {
                subject?.name?.toLowerCase() !== 'lekki' &&
                  
                  (
                    <div className="css-dropdown" ref={yearsRef} tabIndex={0}>
                      <input type="checkbox" id="years-toggle" className="dropdown-toggle" checked={yearsOpen} readOnly />
                      <label htmlFor="years-toggle" className="dropdown-label" onClick={toggleYears}>
                        <span id="yearsLabel">{getYearsLabel()}</span>
                        <span className="dropdown-arrow">▼</span>
                      </label>
                      {yearsOpen  && (
                        <div className="dropdown-menu">
                          <div className="checkbox-item select-all-row">
                            <input
                              type="checkbox"
                              id="year-select-all"
                              className="select-all"
                              checked={selectedYears.length === subject.years.length}
                              onChange={handleSelectAllYears}
                            />
                            <label htmlFor="year-select-all"><strong>Select All Years</strong></label>
                          </div>
                          <div className="divider"></div>
                          <div className="dropdown-scroll-area">
                            {subject.years.map(year => (
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
                        </div>
                      )}
                    </div>
                  )
              }
            </form>
          </div>
        </div>
      </div>

      <main className="study-two-main" id="study-two-container">
        <div className="study-two-card">
          <h3 className="study-two-card-title">Start Study Session</h3>

          {actionCards.length > 0 ? (
            <div
              className="study-two-action-grid"
              data-count={actionCards.length}
            >
              {actionCards.map(card => (
                <Link key={card.key} to={card.to} className="study-two-action-card">
                  <div className="study-two-action-icon"><i className={`fas ${card.icon}`}></i></div>
                  <div className="study-two-action-title">{card.title}</div>
                  <div className="study-two-action-desc">{card.desc}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="study-two-empty-state">
              <div className="study-two-empty-icon"><i className="fas fa-hourglass-half"></i></div>
              <div className="study-two-empty-title">Study materials coming soon</div>
              <div className="study-two-empty-desc">
                There's no search or syllabus material for {formatName(subject.name)} just yet — you can still jump straight into a study session below.
              </div>
            </div>
          )}

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