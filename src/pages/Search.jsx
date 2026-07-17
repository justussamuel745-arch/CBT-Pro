import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate} from 'react-router';
import UserContext from '../context/UserContext';
import { fetchWithAuth } from '../scripts/utilis/fetch';
import { ToastProvider, useToast, CSS } from '../components/NotificationSystem';
import './Search.css';

const EXAM_TYPES = ["JAMB"];

/* ---------- Small pieces ---------- */

function ExamBadge({ type }) {
  return <span className={`pq-badge pq-badge--${type.toLowerCase()}`}>{type}</span>;
}

function EmptyState({ icon, title, note }) {
  return (
    <div className="pq-empty">
      <span className="pq-empty-icon"><i className={`fa-solid ${icon}`} /></span>
      <p className="pq-empty-title">{title}</p>
      <p className="pq-empty-note">{note}</p>
    </div>
  );
}

function QuestionCard({ item, onOpen }) {
  return (
    <button className="pq-card" onClick={() => onOpen(item)}>
      <div className="pq-card-top">
        <ExamBadge type="JAMB" />
        <span className="pq-card-year">{item.year}</span>
      </div>
      <p className="pq-card-topic">{item.topic}</p>
      <p className="pq-card-question" dangerouslySetInnerHTML={{__html: typeof item.question !== 'object' ? item.question : item.question?.qs}} />
      <span className="pq-card-more">
        View details <i className="fa-solid fa-chevron-right" />
      </span>
    </button>
  );
}

function DetailModal({ item, onClose }) {
  return (
    <div className="pq-modal-backdrop" onClick={onClose}>
      <div className="pq-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pq-modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>

        <div className="pq-modal-tags">
          <ExamBadge type="JAMB" />
          <span className="pq-modal-tag"><i className="fa-solid fa-calendar" /> {item.year}</span>
          <span className="pq-modal-tag"><i className="fa-solid fa-tag" /> {item.topic}</span>
        </div>

        <h3 className="pq-modal-question" dangerouslySetInnerHTML={{__html: typeof item.question !== 'object' ? item.question : item.question?.qs}}></h3>

        <ul className="pq-modal-options">
          {item.options.map(opt => (
            <li key={opt.id} className={`pq-modal-option ${opt.id === item.correctAnswers.join('') ? "pq-modal-option--correct" : ""}`}>
              <span className="pq-modal-option-letter">{opt.id.toUpperCase()}</span>
              <span className="pq-modal-option-text">{opt.option}</span>
              {opt.id === item.correctAnswers.join('') && <i className="fa-solid fa-circle-check pq-modal-option-check" />}
            </li>
          ))}
        </ul>

        <div className="pq-modal-explanation">
          <p className="pq-modal-explanation-label"><i className="fa-solid fa-lightbulb" /> Explanation</p>
          <p className="pq-modal-explanation-text" dangerouslySetInnerHTML={{__html: item.explanation?.text}}></p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

function SearchInner() {
  const { token, setToken, isActivated } = useContext(UserContext)
  const [query, setQuery] = useState("");
  const [examType, setExamType] = useState("All");
  const [year, setYear] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  
  const toast = useToast()
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const subject = searchParams.get('subject')
  
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);

  const years = ["All", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "1996", "1995", "1994", "1993", "1992", "1991", "1990", "1989", "1988", "1987", "1986", "1985", "1984", "1983"]
  async function runSearch() {
    if (!query){
      alert('Provide a question')
      return
    }
    if (!isActivated){
      alert('To search past questions, please activate your account.')
      return
    }
    setIsSearching(true);
    try {
      const response = await fetchWithAuth(token, setToken, `/api/search?subject=${subject.toLowerCase()}${year !== 'All' ? `&year=${year}` : ''}${query ? `&keyword=${query}` : ''}`, {
        method: 'GET'
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok){
        throw { status: response.status, error: data?.message || data.errror || 'Failed to complete search.'}
      }
      setResults(data);
      setHasSearched(true);
      
    } catch (err) {
      console.error('Error:', err);
      if (!err.status){
        toast.push({ variant: 'pill', type: 'error', message: "No network connection." });
      } else if (err.status >= 500){
        toast.push({ variant: 'pill', type: 'error', message: "Unexpected error. Try again later" });
      } else {
        toast.push({ variant: 'pill', type: 'error', message: err.error });
      }

    } finally{
      setIsSearching(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") runSearch();
  }

  function clearFilters() {
    setQuery("");
    setExamType("All");
    setYear("All");
    setHasSearched(false);
    setResults([]);
  }

  return (
    <div className="pq-root">
      <div className="pq-page">
        <button className="pq-back" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left" /> Study Mode
        </button>

        <div className="pq-header">
          <div className="pq-header-subject">
            <span className="pq-header-subject-chip">{subject}</span>
          </div>
          <h1 className="pq-title">Search Past Questions</h1>
          <p className="pq-sub">Find real past JAMB, questions from {subject}.</p>
        </div>

        <div className="pq-search-card">
          <div className="pq-search-input-wrap">
            <i className="fa-solid fa-magnifying-glass pq-search-input-icon" />
            <input
              className="pq-search-input"
              placeholder="Search by keyword or topic..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="pq-filters">
            <div className="pq-filter-group">
              <label>Exam Type</label>
              <select className="pq-filter-select" value={examType} onChange={(e) => setExamType(e.target.value)}>
                {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="pq-filter-group">
              <label>Year</label>
              <select className="pq-filter-select" value={year} onChange={(e) => setYear(e.target.value === "All" ? "All" : Number(e.target.value))}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="pq-search-actions">
            <button className="pq-search-btn" onClick={runSearch} disabled={isSearching}>
              <i className="fa-solid fa-magnifying-glass" />
              {isSearching ? "Searching..." : "Search Questions"}
            </button>
            {hasSearched && (
              <button className="pq-clear-btn" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>

        {isSearching && (
          <div className="pq-loading">
            <div className="pq-loading-spinner" />
            <p className="pq-loading-text">Searching {subject} past questions...</p>
          </div>
        )}

        {!isSearching && !hasSearched && (
          <EmptyState
            icon="fa-magnifying-glass"
            title="Search for past questions"
            note={`Enter a keyword, pick a filter if you like, then press "Search Questions" to see results from ${subject}.`}
          />
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <EmptyState
            icon="fa-inbox"
            title="No questions found"
            note="Try a different keyword, or clear your filters and search again."
          />
        )}

        {!isSearching && hasSearched && results.length > 0 && (
          <>
            <div className="pq-results-head">
              <span className="pq-results-count"><strong>{results.length}</strong> question{results.length !== 1 ? "s" : ""} found</span>
            </div>
            <div className="pq-results-list">
              {results.map((item) => (
                <QuestionCard key={item.id} item={item} onOpen={setSelected} />
              ))}
            </div>
          </>
        )}
      </div>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default function Search() {
  return (
    <ToastProvider position="top-right">
      <SearchInner />
    </ToastProvider>
  );
}
