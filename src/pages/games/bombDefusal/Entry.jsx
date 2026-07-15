import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router';
import { useGameContext } from '../../../context/GameContext';

/* ============================================================
   CBT PRO — Subject & Topic Entry (HUD Edition)
   Matches Bomb Defusal Championship design language:
   "Reactor Core" tactical HUD — void navy / cyan core /
   danger red / success green / amber warn.
   Icons: Font Awesome 6 via CDN.
   Prefixes: subj- (subject list) / topic- (topic list) / ready-
   ============================================================ */

const FA_CDN = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
`;

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

const CURATED_TOPICS = {
  mathematics: [
    "Number Bases", "Fractions, Decimals & Approximations", "Indices, Logarithms & Surds",
    "Sets", "Polynomials", "Simultaneous Equations", "Quadratic Equations", "Sequence & Series",
    "Matrices & Determinants", "Trigonometry", "Coordinate Geometry", "Differentiation & Integration",
    "Statistics", "Probability",
  ],
  physics: [
    "Measurements & Units", "Motion", "Force & Newton's Laws", "Work, Energy & Power",
    "Waves", "Optics", "Electricity & Magnetism", "Electromagnetic Induction",
    "Heat & Thermodynamics", "Modern Physics",
  ],
  chemistry: [
    "Atomic Structure", "Periodic Table & Periodicity", "Chemical Bonding",
    "States of Matter", "Acids, Bases & Salts", "Chemical Energetics",
    "Rates of Reaction", "Electrolysis & Electrochemistry", "Organic Chemistry", "Industrial Chemistry",
  ],
  biology: [
    "Cell Structure & Function", "Nutrition", "Transport Systems", "Respiration",
    "Reproduction", "Growth & Development", "Ecology", "Genetics & Evolution",
    "Nervous & Hormonal Coordination", "Diseases & Immunity",
  ],
  english: [
    "Comprehension", "Lexis & Structure", "Oral English", "Essay Writing",
    "Letter Writing", "Summary", "Synonyms & Antonyms", "Figures of Speech",
  ],
  economics: [
    "Basic Economic Concepts", "Demand & Supply", "Theory of Production",
    "Market Structures", "National Income", "Money & Banking", "Public Finance",
    "International Trade", "Economic Development",
  ],
  government: [
    "Basic Political Concepts", "Forms of Government", "The Constitution",
    "Organs of Government", "Political Parties", "Nigerian Independence Movement",
    "International Relations",
  ],
  literature: [
    "African Prose", "Non-African Prose", "African Drama", "African Poetry",
    "Non-African Drama & Poetry", "Literary Devices & Terms",
  ],
  commerce: [
    "Nature of Commerce", "Trade & Aids to Trade", "Business Organisation",
    "Money & Banking", "Insurance", "Transportation & Communication", "Stock Exchange",
  ],
  accounting: [
    "Basic Accounting Concepts", "Books of Original Entry", "The Ledger & Trial Balance",
    "Final Accounts", "Depreciation", "Bank Reconciliation", "Partnership Accounts",
  ],
  geography: [
    "Map Reading & Interpretation", "Weather & Climate", "Landforms", "Rocks & Minerals",
    "Population & Settlement", "Nigeria's Economy", "Regional Geography",
  ],
  civic: [
    "Citizenship", "Rights & Duties", "Rule of Law", "Democracy",
    "National Values", "Consumer Rights", "Civil Society",
  ],
  computer: [
    "Computer Fundamentals", "Number Systems", "Hardware & Software",
    "Operating Systems", "Programming Basics", "Data Processing", "Computer Networks",
  ],
};

function topicsFor(subject) {
  if (CURATED_TOPICS[subject.id]) return CURATED_TOPICS[subject.id];
  return [
    `Introduction to ${subject.name}`,
    "Core Concepts I",
    "Core Concepts II",
    "Key Principles & Terminology",
    "Applications & Case Studies",
    "Common Exam Question Patterns",
  ];
}

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

/* ---------- Subject list ---------- */

function SubjectListScreen({ onSelect }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate()

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
        <p className="subj-sub">Select a subject to load its topic index.</p>
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
            {cat.subjects.map((s) => {
              const topicCount = topicsFor(s).length;
              return (
                <button className="subj-card" key={s.id} onClick={() => onSelect(s)}>
                  <CornerFrame />
                  <span className="subj-card-icon">
                    <i className={`fa-solid ${s.icon}`} />
                  </span>
                  <span className="subj-card-name">{s.name}</span>
                  <span className="subj-card-meta hud-mono">{topicCount} TOPICS</span>
                  <i className="fa-solid fa-chevron-right subj-card-arrow" />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------- Topic list ---------- */

function TopicListScreen({ subject, onBack, onBegin }) {
  const topics = topicsFor(subject);
  const [selected, setSelected] = useState(topics[0]);

  return (
    <div className="topic-page">
      <button className="topic-back" onClick={onBack}>
        <i className="fa-solid fa-arrow-left" /> Subjects
      </button>

      <header className="topic-header">
        <span className="topic-header-icon">
          <i className={`fa-solid ${subject.icon}`} />
        </span>
        <div>
          <p className="topic-eyebrow hud-mono">{topics.length} TOPICS LOADED</p>
          <h1 className="topic-title hud-display">{subject.name}</h1>
        </div>
      </header>

      <ul className="topic-list">
        {topics.map((t, i) => {
          const isSelected = t === selected;
          return (
            <li key={t}>
              <button
                className={`topic-row ${isSelected ? "topic-row--selected" : ""}`}
                onClick={() => setSelected(t)}
              >
                <span className="topic-row-check">
                  <i className={isSelected ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} />
                </span>
                <span className="topic-row-text">
                  <span className="topic-row-index hud-mono">{String(i + 1).padStart(2, "0")}</span>
                  {t}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="topic-footer">
        <button className="topic-begin" onClick={() => onBegin(subject, selected)}>
          <i className="fa-solid fa-play" />
          Begin: {selected}
        </button>
      </div>
    </div>
  );
}

/* ---------- Ready / confirmation ---------- */

function ReadyScreen({ subject, topic, onBack }) {
  const { setPage } = useGameContext()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage('start')
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  },[])
  
  
  return (
    <div className="ready-page">
      <div className="ready-glow" />
      <span className="ready-icon">
        <i className={`fa-solid ${subject.icon}`} />
      </span>
      <p className="ready-eyebrow hud-mono">SESSION READY</p>
      <h1 className="ready-title hud-display">{topic}</h1>
      <p className="ready-sub">{subject.name} · Practice questions will load here.</p>
      <button className="ready-back" onClick={onBack}>
        <i className="fa-solid fa-arrow-left" /> Choose another topic
      </button>
    </div>
  );
}

/* ---------- Root ---------- */

export function Entry() {
  const [screen, setScreen] = useState("subjects"); // subjects | topics | ready
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);

  function handleSelectSubject(s) {
    setSubject(s);
    setScreen("topics");
  }
  function handleBegin(s, t) {
    setSubject(s);
    setTopic(t);
    setScreen("ready");
  }

  return (
    <div className="entry-root">
      <link rel="stylesheet" href={FA_CDN} />
      <style>{`
        ${FONT_IMPORT}
        .entry-root {
          --void: #060A14;
          --panel: #0E1526;
          --panel2: #121B31;
          --line: #1D2A46;
          --cyan: #22D3EE;
          --cyan-dim: #0E7490;
          --danger: #FF4757;
          --success: #2ED573;
          --amber: #FFC048;
          --text: #E7EDF7;
          --text-dim: #7C8AA8;
          font-family: 'Inter', system-ui, sans-serif;
          background: radial-gradient(circle at 50% 0%, #0C1428 0%, var(--void) 60%);
          color: var(--text);
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 20px 16px 40px;
        }
        .entry-root * { box-sizing: border-box; }
        .entry-root button { font-family: inherit; cursor: pointer; border: none; background: none; }
        .hud-display { font-family: 'Rajdhani', sans-serif; }
        .hud-mono { font-family: 'Share Tech Mono', monospace; }

        .hud-corner { position: absolute; width: 12px; height: 12px; border: 2px solid var(--cyan); opacity: .6; }
        .hud-corner--tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .hud-corner--tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
        .hud-corner--bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
        .hud-corner--br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

        /* ---------- SUBJECT LIST ---------- */
        .subj-page { max-width: 560px; margin: 0 auto; position: relative; }
        .subj-scanline { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(34,211,238,.03) 0px, transparent 2px, transparent 5px); pointer-events: none; }
        .subj-header { margin-bottom: 18px; position: relative; }
        .subj-eyebrow { font-size: 11px; letter-spacing: 2px; color: var(--cyan); margin: 0 0 8px; }
        .subj-title { font-size: 28px; font-weight: 700; margin: 0 0 6px; letter-spacing: .3px; }
        .subj-sub { font-size: 13.5px; color: var(--text-dim); margin: 0; }
        .subj-search { position: relative; margin-bottom: 24px; }
        .subj-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-dim); font-size: 13px; }
        .subj-search-input { width: 100%; padding: 13px 16px 13px 38px; border-radius: 10px; border: 1px solid var(--line); background: var(--panel); font-size: 14px; color: var(--text); outline: none; }
        .subj-search-input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(34,211,238,.12); }
        .subj-search-input::placeholder { color: var(--text-dim); }
        .subj-empty { color: var(--text-dim); font-size: 14px; text-align: center; padding: 30px 0; }
        .subj-category { margin-bottom: 24px; }
        .subj-category-label { font-size: 11.5px; letter-spacing: 1.5px; color: var(--cyan-dim); margin: 0 0 10px; padding-left: 2px; }
        .subj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .subj-card {
          position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 7px;
          background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 14px;
          text-align: left; transition: border-color .15s, box-shadow .15s;
        }
        .subj-card:hover { border-color: var(--cyan); box-shadow: 0 0 16px rgba(34,211,238,.15); }
        .subj-card-icon {
          width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          background: var(--panel2); border: 1px solid var(--line); color: var(--cyan); font-size: 15px;
        }
        .subj-card-name { font-family: 'Rajdhani', sans-serif; font-weight: 600; font-size: 14.5px; color: var(--text); line-height: 1.25; }
        .subj-card-meta { font-size: 10px; letter-spacing: .5px; color: var(--text-dim); }
        .subj-card-arrow { position: absolute; top: 15px; right: 12px; color: var(--text-dim); font-size: 12px; }

        /* ---------- TOPIC LIST ---------- */
        .topic-page { max-width: 560px; margin: 0 auto; padding-bottom: 90px; position: relative; }
        .topic-back { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; color: var(--cyan); margin-bottom: 18px; padding: 4px 0; }
        .topic-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .topic-header-icon { width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--panel2); border: 1px solid var(--cyan-dim); color: var(--cyan); font-size: 20px; }
        .topic-eyebrow { font-size: 11px; letter-spacing: 1.5px; color: var(--cyan); margin: 0 0 4px; }
        .topic-title { font-size: 23px; font-weight: 700; margin: 0; }
        .topic-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .topic-row {
          width: 100%; display: flex; align-items: center; gap: 12px; padding: 13px 14px;
          border-radius: 12px; border: 1px solid var(--line); background: var(--panel); color: var(--text-dim);
        }
        .topic-row--selected { border-color: var(--cyan); background: rgba(34,211,238,.06); color: var(--cyan); }
        .topic-row-check { flex-shrink: 0; display: flex; font-size: 18px; }
        .topic-row-text { display: flex; align-items: center; gap: 10px; font-size: 14.5px; font-weight: 500; color: var(--text); }
        .topic-row-index { font-size: 11px; color: var(--text-dim); }
        .topic-footer { position: fixed; left: 0; right: 0; bottom: 0; padding: 14px 16px 20px; background: linear-gradient(180deg, transparent, var(--void) 35%); }
        .topic-begin { max-width: 528px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px; padding: 15px; border-radius: 13px; background: var(--cyan); color: var(--text); font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 15.5px; letter-spacing: .3px; box-shadow: 0 8px 22px rgba(34,211,238,.3); }

        /* ---------- READY ---------- */
        .ready-page { max-width: 420px; margin: 70px auto 0; text-align: center; position: relative; }
        .ready-glow { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); width: 220px; height: 220px; background: radial-gradient(circle, rgba(34,211,238,.22), transparent 70%); pointer-events: none; }
        .ready-icon { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 18px; background: var(--panel2); border: 1px solid var(--cyan); color: var(--cyan); font-size: 24px; margin-bottom: 18px; box-shadow: 0 0 22px rgba(34,211,238,.25); }
        .ready-eyebrow { font-size: 11px; letter-spacing: 2px; color: var(--success); margin: 0 0 8px; position: relative; }
        .ready-title { font-size: 24px; font-weight: 700; margin: 0 0 6px; position: relative; }
        .ready-sub { font-size: 13.5px; color: var(--text-dim); margin: 0 0 26px; position: relative; }
        .ready-back { position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 13px 20px; border-radius: 12px; border: 1px solid var(--line); background: var(--panel); color: var(--text); font-weight: 600; font-size: 14px; }
      `}</style>

      {screen === "subjects" && <SubjectListScreen onSelect={handleSelectSubject} />}
      {screen === "topics" && subject && (
        <TopicListScreen subject={subject} onBack={() => setScreen("subjects")} onBegin={handleBegin} />
      )}
      {screen === "ready" && subject && topic && (
        <ReadyScreen subject={subject} topic={topic} onBack={() => setScreen("topics")} />
      )}
    </div>
  );
}
