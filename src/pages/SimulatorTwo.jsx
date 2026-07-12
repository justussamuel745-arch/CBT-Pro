import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import UserContext from '../context/UserContext.jsx';
import { subjectsData } from '../scripts/data/subjectsData.js';
import { formatName } from '../scripts/utilis/formatName.js';
import { ModalStripe, ModalDialog, CSS } from '../components/NotificationSystem'
import './SimulatorTwo.css';

export function SimulatorTwo() {
  const { isActivated, examConfig, setExamConfig, setExamQuestions} = useContext(UserContext);
  const navigate = useNavigate()

  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  /*===== Render Notification Style ======*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);

  const subjectIcon = {};
  examConfig.subjects.forEach((sub) => {
    const data = subjectsData.find(d => d.name === sub.name);
    if (data) subjectIcon[sub.name] = data.icon;
  });

  function getQuesNo(event) {
    const subName = event.target.dataset.subname;
    let qsNo = Number(event.target.value);
    if (!isActivated) {
      if (subName === 'English') {
        qsNo = 60
      } else {
        qsNo = 40
      }
    }

    setExamConfig(prev => ({
      ...prev,
      subjects: prev.subjects.map(sub =>
        sub.name === subName ? { ...sub, qsNo } : sub
      )
    }));
  }

  function setHours(event) {
    setExamConfig(prev => ({
      ...prev,
      hours: Number(event.target.value)
    }));
  }

  function setMinutes(event) {
    setExamConfig(prev => ({
      ...prev,
      minutes: Number(event.target.value)
    }));
  }

  function startExam() {
    /* Clean up from previous exam */
    setExamQuestions([])
    if (!examConfig.hours && !examConfig.minutes) {
      setModal('config_warning')
      return
    }

    if (!isActivated) {
      setModal('activate_app')
    } else {
      navigate('/exam')
    }
  }


  return (
    <>
      <title>CBT Pro - Configure Exam</title>

      {modal === 'activate_app' && (
        <div className="ns-overlay" onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
            <ModalDialog
              type="info"
              title="Activation Required"
              subtitle="Access Restricted • CBT Pro Policy"
              body="Your account is not activated. Access is limited to questions from a single year. The selected number of questions isn&apos;t available on your current plan. Default settings will be used. Activate to unlock full access to all features."
              primaryLabel="Activate App"
              onPrimary={() => navigate('/payment')}
              onClose={() => {closeModal(); navigate('/exam')}}
              closeLabel="Skip"
            />
          </div>
        </div>
      )}
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <div className="logo">CBT Pro</div>
          </div>
        </div>
      </nav>

      <section className="page-header padding-reset margin-reset">
        <div className="simulator-two-header-inner">
          <div className="simulator-two-breadcrumb">
            <Link to="/" className="f-w-500 link-color">Dashboard</Link> /
            <Link to="/simulator" className="f-w-500 link-color">Subjects</Link> /
            <span>Configure</span>
          </div>
          <h1>Configure Your Exam</h1>
        </div>
      </section>

      <div className="simulator-two-container">
        {/* SUBJECTS */}
        <div className="simulator-two-panel">
          <div className="simulator-two-panel-header">
            <h2>Selected Subjects</h2>
            <div className="simulator-two-subject-count">
              {examConfig.subjects.length} {examConfig.subjects.length === 1 ? 'Subject' : 'Subjects'}
            </div>
          </div>

          <div className="simulator-two-subject-list">
            {examConfig.subjects.map((sub) => {
              const defaultQsNo = sub.name === 'English' ? 60 : 40;
              return (
                <div className="simulator-two-subject-item" key={sub.name}>
                  <div className="simulator-two-subject-left">
                    <div className="simulator-two-subject-icon" dangerouslySetInnerHTML={{ __html: subjectIcon[sub.name] }} />
                    <div className="simulator-two-subject-name">{formatName(sub.name)}</div>
                  </div>
                  <select
                    className="q-chip"
                    onChange={getQuesNo}
                    data-subname={sub.name}
                    value={sub.qsNo ?? defaultQsNo}
                  >
                    <option value="10">10 Qs</option>
                    <option value="20">20 Qs</option>
                    <option value="40">40 Qs</option>
                    <option value="60">60 Qs</option>
                  </select>
                </div>
              )
            })}
          </div>
        </div>

        {/* CONFIG */}
        <div className="simulator-two-panel simulator-two-config-panel">
          <div className="simulator-two-config-section">
            <div className="simulator-two-section-labelbel">Test Duration</div>
            <div className="simulator-two-time-grid">
              <div className="time-field">
                <label>Hours</label>
                <select value={examConfig.hours} onChange={setHours}>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div className="time-field">
                <label>Minutes</label>
                <select value={examConfig.minutes} onChange={setMinutes}>
                  <option value="0">0</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                </select>
              </div>
            </div>
          </div>

          <div className="proceed-wrap">
            <button className="proceed-btn" onClick={startExam}>
              Start Exam →
            </button>
          </div>
        </div>

        {modal === 'config_warning' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalStripe
                type="warning"
                title="Invalid exam duration"
                body="Exam duration cannot be 0 hours 0 minutes. Choose a duration so students know how long they have."
                primaryLabel="Fix Duration"
                onPrimary={() => closeModal()}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}