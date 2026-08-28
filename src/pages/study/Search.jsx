import { useState } from "react";
import { useSearchParams, useNavigate} from 'react-router';
import { toast } from 'react-hot-toast';
import { MarkdownContent } from '../../components/MarkdownContent';
import { request } from '../../scripts/utilis/request';
import { Image } from '../../components/Image';
import { formatName } from '../../scripts/utilis/formatName.js';
import { decrypt } from '../../scripts/utilis/crypto';
import { authStore } from '../../stores/authStore';
import { saveQuestions } from '../../hooks/services/indexedDB/questions';
import { saveAllImages } from '../../hooks/services/indexedDB/images';
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

        {item.image?.url && <Image imageUrl={item.image.url} />}
        { typeof item.question === 'object' && item.question?.comprehension && <h4 className="pq-modal-question" dangerouslySetInnerHTML={{__html: item.question.comprehension}}></h4> }
        <p className="pq-modal-question">
          <MarkdownContent>
            {typeof item.question !== 'object' ? item.question : item.question?.qs}
          </MarkdownContent>
        </p>

        <ul className="pq-modal-options">
          {item.options.map(opt => (
            <li key={opt.id} className={`pq-modal-option ${opt.id === item.correctAnswers.join('') ? "pq-modal-option--correct" : ""}`}>
              <span className="pq-modal-option-letter">{opt.id.toUpperCase()}</span>
              <span className="pq-modal-option-text">
                <MarkdownContent>
                  { opt.option }
                </MarkdownContent>
              </span>
              {opt.id === item.correctAnswers.join('') && <i className="fa-solid fa-circle-check pq-modal-option-check" />}
            </li>
          ))}
        </ul>

        <div className="pq-modal-explanation">
          <p className="pq-modal-explanation-label"><i className="fa-solid fa-lightbulb" /> Explanation</p>
          <p className="pq-modal-explanation-text">
            <MarkdownContent>
              { item.explanation?.text }
            </MarkdownContent>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function Search() {
  const isActivated = authStore(state => state.isActivated)
  const [query, setQuery] = useState("");
  const [examType, setExamType] = useState("All");
  const [year, setYear] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const subject = searchParams.get('subject')


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
      const res = await request.auth(`/api/search?subject=${subject.toLowerCase()}${year !== 'All' ? `&year=${year}` : ''}${query ? `&keyword=${query}` : ''}`, {
        method: 'GET'
      })
      const data = decrypt(res.body.data)
      await Promise.all([
        saveQuestions(data),
        saveAllImages(data)
      ]).catch((err) => console.log(err))
      setResults(data);
      setHasSearched(true)
      
    } catch {
      toast.error('Failed to fetch')
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
            <span className="pq-header-subject-chip">{formatName(subject)}</span>
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