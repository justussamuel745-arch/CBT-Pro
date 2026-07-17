import React, { useState, useMemo } from "react";
import { useNavigate } from 'react-router';
import { useGameContext } from '../../../context/GameContext';
import './Entry.css';

/* ---------- Subject list ---------- */

const CATEGORIES = [
  {
    id: "sciences",
    label: "Sciences",
    subjects: [
      { id: "mathematics", name: "Mathematics", icon: "fa-calculator" },
      { id: "physics", name: "Physics", icon: "fa-atom" },
      { id: "chemistry", name: "Chemistry", icon: "fa-flask" },
      { id: "biology", name: "Biology", icon: "fa-dna" },
      { id: "agric", name: "Agricultural Science", icon: "fa-seedling" },
      { id: "computer", name: "Computer Studies", icon: "fa-microchip" },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    subjects: [
      { id: "economics", name: "Economics", icon: "fa-chart-line" },
      { id: "commerce", name: "Commerce", icon: "fa-building-columns" },
      { id: "accounting", name: "Financial Accounting", icon: "fa-file-invoice-dollar" },
      { id: "insurance", name: "Insurance", icon: "fa-shield-halved" },
      { id: "office-practice", name: "Office Practice", icon: "fa-briefcase" },
      { id: "store-mgt", name: "Store Management", icon: "fa-boxes-stacked" },
    ],
  },
  {
    id: "arts",
    label: "Arts & Humanities",
    subjects: [
      { id: "english", name: "English Language", icon: "fa-book-open" },
      { id: "literature", name: "Literature-in-English", icon: "fa-feather-pointed" },
      { id: "history", name: "History", icon: "fa-scroll" },
      { id: "government", name: "Government", icon: "fa-gavel" },
      { id: "civic", name: "Civic Education", icon: "fa-people-group" },
      { id: "crs", name: "Christian Religious Studies", icon: "fa-church" },
      { id: "irs", name: "Islamic Religious Studies", icon: "fa-moon" },
      { id: "fine-arts", name: "Fine Arts", icon: "fa-palette" },
      { id: "music", name: "Music", icon: "fa-music" },
    ],
  },
  {
    id: "languages",
    label: "Languages",
    subjects: [
      { id: "french", name: "French", icon: "fa-earth-europe" },
      { id: "arabic", name: "Arabic", icon: "fa-language" },
      { id: "hausa", name: "Hausa", icon: "fa-language" },
      { id: "igbo", name: "Igbo", icon: "fa-language" },
      { id: "yoruba", name: "Yoruba", icon: "fa-language" },
    ],
  },
  {
    id: "vocational",
    label: "Vocational & Others",
    subjects: [
      { id: "geography", name: "Geography", icon: "fa-map" },
      { id: "home-econ", name: "Home Economics", icon: "fa-house" },
      { id: "animal-husbandry", name: "Animal Husbandry", icon: "fa-cow" },
      { id: "physical-ed", name: "Physical Education", icon: "fa-dumbbell" },
    ],
  },
];

/* ---------- Shared HUD corner frame ---------- */

function CornerFrame() {
  return (
    <>
      <span className="hud-corner hud-corner--tl" />
      <span className="hud-corner hud-corner--tr" />
      <span className="hud-corner hud-corner--bl" />
      <span className="hud-corner hud-corner--br" />
    </>
  );
}

/* ---------- Subject list (standalone, no topics) ---------- */

function SubjectListScreen({ onSelect }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query.trim()) return CATEGORIES;
    const q = query.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      subjects: cat.subjects.filter((s) => s.name.toLowerCase().includes(q)),
    })).filter((cat) => cat.subjects.length > 0);
  }, [query]);

  return (
    <div className="subj-page">
      <div className="subj-scanline" />
      <header className="subj-header">
        <p className="subj-eyebrow hud-mono" onClick={() => navigate('/')}>CBT PRO · SUBJECT DATABASE</p>
        <h1 className="subj-title hud-display">Choose a Subject</h1>
        <p className="subj-sub">Questions are filtered by your chosen subject.</p>
      </header>

      <div className="subj-search">
        <i className="fa-solid fa-magnifying-glass subj-search-icon" />
        <input
          className="subj-search-input"
          placeholder="Search subjects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <p className="subj-empty">No subjects match "{query}".</p>
      )}

      {filtered.map((cat) => (
        <section className="subj-category" key={cat.id}>
          <h2 className="subj-category-label hud-mono">// {cat.label}</h2>
          <div className="subj-grid">
            {cat.subjects.map((s) => (
              <button
                className="subj-card"
                key={s.id}
                onClick={() => onSelect(s)}
              >
                <CornerFrame />
                <span className="subj-card-icon">
                  <i className={`fa-solid ${s.icon}`} />
                </span>
                <span className="subj-card-name">{s.name}</span>
                <span className="subj-card-meta hud-mono">CLICK TO START</span>
                <i className="fa-solid fa-chevron-right subj-card-arrow" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------- Root Entry ---------- */

export function Entry() {
  const navigate = useNavigate()

  function handleSelectSubject(subject) {
    navigate(`/game/bomb-defusal/start?subject=${subject.id}`)
  }

  return (
    <div className="entry-root">
      <SubjectListScreen onSelect={handleSelectSubject} />
    </div>
  );
}