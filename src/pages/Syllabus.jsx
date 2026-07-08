import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { subjectsData } from '../scripts/data/subjectsData.js';
import { formatName } from '../scripts/utilis/formatName.js';
import './Syllabus.css'

const AVAILABLE_SYLLABUS = [
  "agriculture",
  "arabic",
  "biology",
  "chemistry",
  "computer",
  "crs",
  "economics",
  "english",
  "french",
  "geography",
  "government",
  "literature",
  "mathematics",
  "physicalhealth",
  "physics"
];


export function Syllabus() {
  const [searchParams] = useSearchParams();
  const [modalTitle, setModalTitle] = useState(null)
  const [modalActive, setModalActive] = useState(false)
  const syllabusFrameRef = useRef(null)
  
  const subject = searchParams.get('subject')
  
  useEffect(() => {
    return () => document.body.style.overflow = 'auto';
  },[])
  
  function viewSyllabus(subName){
    setModalTitle(formatName(subName))
    const lowerCaseSub = subName.toLowerCase()
    const syllabusUrl = `/public/syllabus/${lowerCaseSub}.html`
    syllabusFrameRef.current.src = syllabusUrl
    document.body.style.overflow = 'hidden';
    setModalActive(true)
  }
  
  function closeSyllabus(){
    setModalActive(false)
    syllabusFrameRef.current.src = ''
    document.body.style.overflow = 'auto'
  }
  
  if (subject){
    return <iframe src={`/syllabus/${subject}.html`} style={{
      width: '100vw',
      height: '100vh',
      margin: 0
    }} />
  }
  
  return (
    <>
      <title>CBT Pro - Syllabus</title>

      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>
            <div className="nav-right"></div>
          </div>
        </div>
      </nav>

      <div className="syllabus-wrapper">
        <div className="syllabus-header">
          <h1 className="syllabus-title">JAMB Syllabus</h1>
          <p className="syllabus-subtitle">Tap any subject to view PDF syllabus</p>
        </div>

        <div className="syllabus-grid">
          {
            subjectsData.filter(sub => AVAILABLE_SYLLABUS.includes(sub.name.toLowerCase())).map(subject => 
              (
                <div className="syllabus-card" key={subject.id}>
                  <div className="syllabus-card-icon subject-logo" dangerouslySetInnerHTML={{__html: subject.icon}}/>
                  <h3 className="syllabus-card-title">{formatName(subject.name)}</h3>
                  <p className="syllabus-card-desc">{[...subject.topics].splice(0, 4).join(', ')}</p>
                  <button className="syllabus-btn" onClick={() => viewSyllabus(subject.name)}>
                    View Syllabus →
                  </button>
                </div>
              )
            )
          }
        </div>
      </div>

      <div className={`syllabus-modal ${modalActive && 'syllabus-active'}`}>
        <div className="syllabus-modal-content">
          <div className="syllabus-modal-header">
            <h3 className="syllabus-modal-title">{modalTitle} Syllabus</h3>
            <button className="syllabus-modal-close" onClick={closeSyllabus}>×</button>
          </div>
          <iframe className="syllabus-pdf-frame" ref={syllabusFrameRef}></iframe>
        </div>
      </div>
    </>
  )
}