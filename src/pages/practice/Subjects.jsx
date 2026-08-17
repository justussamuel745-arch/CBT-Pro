import { useState } from 'react'
import { Link, useNavigate } from 'react-router';
import { subjectsData } from '../../scripts/data/subjectsData';
import { formatName } from '../../scripts/utilis/formatName';
import { authStore } from '../../stores/authStore';
import { practiceStore } from '../../stores/practiceStore';
import './Subjects.css'

const JAMB_SUBJECTS = subjectsData.map(subject => subject.name)

export default function Subjects() {
  const isActivated = authStore(state => state.isActivated)
  const setExamConfig = practiceStore(state => state.setExamConfig)
  const navigate = useNavigate()
  const [selectedSubjects, setSelectedSubjects] = useState(['English'])
  
  function toggleSubject(event){
    const { subject } = event.currentTarget.dataset
    selectedSubjects.includes(subject) 
    ? setSelectedSubjects(selectedSubjects.filter(sub => sub !== subject ))
    : setSelectedSubjects([...selectedSubjects, subject])
  }
  
  function startExam(){
    const setup = []
    selectedSubjects.forEach(subject => {
      const qsNo = subject === 'English' ? 60 : 40
      setup.push({name: subject, qsNo })
    })
    
    setExamConfig({
      subjects: setup,
      hours: 2,
      minutes: 0
    })
    navigate('/practice/config')
  }
  
  
  return (
    <>
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <div className="logo">CBT Pro</div>
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

      <section className="page-header margin padding">
        <div className="header-inner">
          <div className="breadcrumb text-start">
            <Link to="/">Dashboard</Link> / <span>subjects</span>
          </div>
          <h1>Select Your Subjects</h1>
          <p>Choose any number of JAMB subjects to start your CBT session</p>
        </div>
      </section>

      <div className="practice-container">
        <div className="practice-card">
          <div className="practice-card-header">
            <h2>All JAMB Subjects</h2>
            <div className="practice-counter"><span>{selectedSubjects.length}</span> Selected</div>
          </div>

          <div className="practice-subject-grid">
            {JAMB_SUBJECTS.map((subject, index) => 
            (
              <div className={`practice-subject-card ${selectedSubjects.includes(subject) ? 'selected' : ''}`} key={index} onClick={toggleSubject} data-subject={`${subject}`}>
                <div className="check"></div>
                <div className="practice-subject-name">{formatName(subject)}</div>
              </div>
            ))}
          </div>

          <div className="practice-actions">
            <button className="btn-start btn-secondary" onClick={() => setSelectedSubjects([])}>Clear All</button>
            <button className="btn-start" disabled={selectedSubjects.length === 0 ? true : false} onClick={startExam}>Start Exam →</button>
          </div>
        </div>
      </div>
    </>
  )
}