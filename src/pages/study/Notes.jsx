import { useState, useMemo } from "react";
import { useSearchParams, Link, Navigate } from "react-router";
import './Notes.css';
import { subjectsData } from '../../scripts/data/subjectsData';
import { getSubjectNotes } from '../../constant/notesData';
import { formatName } from '../../scripts/utils/formatName';

export default function Notes() {
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get("subject");

  const subject = subjectsData.find(
    s => s.name.toLowerCase() === (subjectParam || "").toLowerCase()
  );

  const rawNotes = subject ? getSubjectNotes(subject.id) : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  // Turn each note's raw content string into clean paragraphs
  const notes = useMemo(() => {
    return rawNotes.map(n => {
      const paragraphs = (n.content || "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);
      return { ...n, paragraphs };
    });
  }, [rawNotes]);

  if (!subject || notes.length === 0) {
    return <Navigate to="/study" />;
  }

  const active = notes[activeIndex];

  const goTo = (idx) => {
    setActiveIndex(idx);
    setMobileListOpen(false);
  };

  return (
    <>
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav>

      <div className="page-header">
        <div className="container">
          <div className="breadcrumb mb-1">
            <Link to="/">Dashboard</Link> / <Link to="/study">Study</Link> /{" "}
            <Link to={`/study/config?id=${subject.id}`}>{formatName(subject.name)}</Link> /{" "}
            <span>Notes</span>
          </div>
          <div className="notes-header">
            <div className="subject-logo" dangerouslySetInnerHTML={{ __html: subject.icon }} />
            <div className="notes-header-text">
              <h1>{formatName(subject.name)} Notes</h1>
              <div className="notes-subtitle">
                {notes.length} topic{notes.length !== 1 ? "s" : ""} available
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="notes-main container">
        {/* MOBILE TOPIC PICKER */}
        <button
          type="button"
          className="notes-mobile-toggle"
          onClick={() => setMobileListOpen(o => !o)}
        >
          <span>{active.topic}</span>
          <i className={`fas fa-chevron-${mobileListOpen ? "up" : "down"}`}></i>
        </button>

        <div className="notes-layout">
          {/* TOPIC LIST */}
          <aside className={`notes-sidebar ${mobileListOpen ? "open" : ""}`}>
            <div className="notes-sidebar-title">Topics</div>
            <div className="notes-topic-list">
              {notes.map((n, idx) => (
                <button
                  key={idx}
                  className={`notes-topic-item ${idx === activeIndex ? "active" : ""}`}
                  onClick={() => goTo(idx)}
                >
                  <span className="notes-topic-title">{n.topic}</span>
                  {n.paragraphs.length === 0 && (
                    <span className="notes-topic-badge">Soon</span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* ACTIVE TOPIC CONTENT */}
          <section className="notes-content">
            <div className="notes-content-card">
              <div className="notes-content-header">
                <h2>{active.topic}</h2>
              </div>

              {active.paragraphs.length > 0 ? (
                <div className="notes-body">
                  {active.paragraphs.map((para, i) => (
                    <p key={i} dangerouslySetInnerHTML={{__html: para}}></p>
                  ))}
                </div>
              ) : (
                <div className="notes-empty">
                  <i className="fas fa-pen-nib"></i>
                  <p>Notes for this topic are being written and will be available soon.</p>
                </div>
              )}

              <div className="notes-nav-buttons">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={activeIndex === 0}
                  onClick={() => goTo(Math.max(0, activeIndex - 1))}
                >
                  <i className="fas fa-arrow-left"></i> Previous
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={activeIndex === notes.length - 1}
                  onClick={() => goTo(Math.min(notes.length - 1, activeIndex + 1))}
                >
                  Next <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}