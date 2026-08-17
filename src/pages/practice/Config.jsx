import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { subjectsData } from '../../scripts/data/subjectsData.js';
import { formatName } from '../../scripts/utilis/formatName.js';
import { ModalStripe, ModalDialog, CSS } from '../../components/NotificationSystem';
import { authStore } from '../../stores/authStore';
import { practiceStore } from '../../stores/practiceStore';
import './Config.css';

export default function Config() {
  const isActivated = authStore(state => state.isActivated)
  const examConfig = practiceStore((state) => state.examConfig);
  const setExamQuestions = practiceStore((state) => state.setExamQuestions);
  const getQuesNo = practiceStore((state) => state.getQuesNo);
  const setHours = practiceStore((state) => state.setHours);
  const setMinutes = practiceStore((state) => state.setMinutes);
  const navigate = useNavigate()
  const [subjectsIcon, setSubjectsIcon] = useState({})
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

  useMemo(() => {
    examConfig.subjects.forEach((sub) => {
      const data = subjectsData.find(d => d.name === sub.name);
      if (data) subjectsIcon[sub.name] = data.icon;
    });
    setSubjectsIcon(subjectsIcon)
  },[setSubjectsIcon])

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
      navigate('/practice/mode')
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
              onClose={() => { closeModal(); navigate('/practice/mode') }}
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
        <div className="practice-two-header-inner">
          <div className="practice-two-breadcrumb">
            <Link to="/" className="f-w-500 link-color">Dashboard</Link> /
            <Link to="/practice" className="f-w-500 link-color">Subjects</Link> /
            <span>Configure</span>
          </div>
          <h1>Configure Your Exam</h1>
        </div>
      </section>

      <div className="practice-two-container">
        {/* SUBJECTS */}
        <div className="practice-two-panel">
          <div className="practice-two-panel-header">
            <h2>Selected Subjects</h2>
            <div className="practice-two-subject-count">
              {examConfig.subjects.length} {examConfig.subjects.length === 1 ? 'Subject' : 'Subjects'}
            </div>
          </div>

          <div className="practice-two-subject-list">
            {examConfig.subjects.map((sub) => {
              const defaultQsNo = sub.name === 'English' ? 60 : 40;
              return (
                <div className="practice-two-subject-item" key={sub.name}>
                  <div className="practice-two-subject-left">
                    <div className="practice-two-subject-icon" dangerouslySetInnerHTML={{ __html: subjectsIcon[sub.name] }} />
                    <div className="practice-two-subject-name">{formatName(sub.name)}</div>
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
        <div className="practice-two-panel practice-two-config-panel">
          <div className="practice-two-config-section">
            <div className="practice-two-section-labelbel">Test Duration</div>
            <div className="practice-two-time-grid">
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