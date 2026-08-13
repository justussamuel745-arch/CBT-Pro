import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { PDFViewer } from '../components/PdfViewer';
import { subjectsData } from '../scripts/data/subjectsData.js';
import { formatName } from '../scripts/utilis/formatName.js';
import './Syllabus.css'

const AVAILABLE_SYLLABUS = [
  "agriculture",
  "arabic",
  "biology",
  "chemistry",
  "computer",
  "crk",
  "economics",
  "english",
  "french",
  "geography",
  "government",
  "literature",
  "mathematics",
  "physicalhealth",
  "physics",
  "accounting",
  "commerce"
];


export default function Syllabus() {
  const [searchParams] = useSearchParams();
  const [modalTitle, setModalTitle] = useState(null)
  const [modalActive, setModalActive] = useState(false)
  const syllabusFrameRef = useRef(null)
  
  const subject = searchParams.get('subject')
  
  useEffect(() => {
    return () => document.body.style.overflow = 'auto';
  },[])
  
  function viewSyllabus(subName){
    setModalTitle([formatName(subName), subName])
    document.body.style.overflow = 'hidden';
    setModalActive(true)
  }
  
  function closeSyllabus(){
    setModalActive(false)
    syllabusFrameRef.current.src = ''
    document.body.style.overflow = 'auto'
  }
  
  function toSentenceCase(word){
    return word.split('')[0].toUpperCase() + word.slice(1).toLowerCase()
  }
  
  if (subject){
    if (AVAILABLE_SYLLABUS.includes(subject)){
      return <PDFViewer fileUrl={`/syllabus/${toSentenceCase(subject)}.pdf`} />
    } else {
      return <h2>Currently Not Available</h2>
    }
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
                  <p className="syllabus-card-desc">{[...subject.topics].splice(0, 2).join(', ').slice(0, 30)}...</p>
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
            <h3 className="syllabus-modal-title">{Array.isArray(modalTitle) && modalTitle[0]} Syllabus</h3>
            <button className="syllabus-modal-close" onClick={closeSyllabus}>×</button>
          </div>
          <PDFViewer fileUrl={`/syllabus/${Array.isArray(modalTitle) && toSentenceCase(modalTitle[1])}.pdf`} />
        </div>
      </div>
    </>
  )
}