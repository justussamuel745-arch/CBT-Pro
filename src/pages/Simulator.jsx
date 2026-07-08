import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router';
import UserContext from '../context/UserContext.jsx'
import { Menu } from '../components/Menu';
import { subjectsData } from '../scripts/data/subjectsData.js';
import { formatName } from '../scripts/utilis/formatName.js';
import './Simulator.css'

const JAMB_SUBJECTS = subjectsData.map(subject => subject.name)

export function Simulator() {
  const { isActivated, setExamConfig } = useContext(UserContext)
  const navigate = useNavigate()
  const [selectedSubjects, setSelectedSubjects] = useState(['English'])
  
  function toggleSubject(event){
    const { subject } = event.currentTarget.dataset
    selectedSubjects.includes(subject) 
    ? setSelectedSubjects(selectedSubjects.filter(sub => sub !== subject ))
    : setSelectedSubjects([...selectedSubjects, subject])
  }
  
  function startExam(){
    setExamConfig([])
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
    navigate('/simulatortwo')
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
              <Menu />
            </div>
          </div>
        </div>
      </nav>

      <section className="page-header margin padding">
        <div className="header-inner">
          <div className="breadcrumb text-start">
            <Link to="/">Home</Link> / <span>subjects</span>
          </div>
          <h1>Select Your Subjects</h1>
          <p>Choose any number of JAMB subjects to start your CBT session</p>
        </div>
      </section>

      <div className="simulator-container">
        <div className="simulator-card">
          <div className="simulator-card-header">
            <h2>All JAMB Subjects</h2>
            <div className="simulator-counter"><span>{selectedSubjects.length}</span> Selected</div>
          </div>

          <div className="simulator-subject-grid">
            {JAMB_SUBJECTS.map((subject, index) => 
            (
              <div className={`simulator-subject-card ${selectedSubjects.includes(subject) ? 'selected' : ''}`} key={index} onClick={toggleSubject} data-subject={`${subject}`}>
                <div className="check"></div>
                <div className="simulator-subject-name">{formatName(subject)}</div>
              </div>
            ))}
          </div>

          <div className="simulator-actions">
            <button className="btn-start btn-secondary" onClick={() => setSelectedSubjects([])}>Clear All</button>
            <button className="btn-start" disabled={selectedSubjects.length === 0 ? true : false} onClick={startExam}>Start Exam →</button>
          </div>
        </div>
      </div>
    </>
  )
}