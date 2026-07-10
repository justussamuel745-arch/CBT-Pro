import { useState } from 'react'
import UserContext from '../context/UserContext.jsx'
import usePWAInstall from "../hooks/usePWAInstall";

function UserProvider({ children }) {
  const [token, setToken] = useState(null)
  const [isActivated, setIsActivated] = useState(null)
  const [error, setError] = useState(null)
  const [examConfig, setExamConfig] = useState(null)
  const [answers, setAnswers] = useState([])
  const [examResults, setExamResults] = useState(null)
  const [studyConfig, setStudyConfig] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)
  
  /*========= Specific to the settings page ====== */
  const [userInfo, setUserInfo] = useState(null);
  const [profileFields, setProfileFields] = useState({
    fullName: '', phoneNumber: '', targetExam: 'JAMB UTME 2027', targetScore: '',
  });
  
  /*========= Specific to the History page ====== */
  const [historyData, setHistoryData] = useState(null)
  
  /* =========== Exam ============*/
  const [examQuestions, setExamQuestions] = useState([])
  
  const pwa = usePWAInstall()

  return (
    <UserContext.Provider value={{
      token,
      setToken,
      isActivated,
      setIsActivated,
      error,
      setError,
      examConfig,
      setExamConfig,
      answers,
      setAnswers,
      examResults,
      setExamResults,
      studyConfig,
      setStudyConfig,
      isAdmin,
      setIsAdmin,
      userInfo,
      setUserInfo,
      profileFields,
      setProfileFields,
      examQuestions,
      setExamQuestions,
      historyData,
      setHistoryData,
      pwa
    }}>
      { children }
    </UserContext.Provider>
  )
}

export default UserProvider