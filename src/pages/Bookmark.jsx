import { useState, useEffect, useContext, useCallback, useRef,  memo } from 'react';
import { Link } from 'react-router';
import UserContext from '../context/UserContext.jsx';
import { subjectsData } from '../scripts/data/subjectsData.js'
import { formatName } from '../scripts/utilis/formatName.js';
import { Image } from '../components/Image';
import './Bookmark.css'

const ExpensiveBmkModal = memo(({ modalQsInfo, setModalQsInfo }) => {
  return (
    <>
    {
      modalQsInfo.map(qs => 
        (
          <div className="bookmark-modal-overlay show" key={qs.id}>
            <div className="bookmark-modal">
              <div className="bookmark-modal-header">
                <div className="bookmark-modal-title">
                  <span>📖</span> Question Details
                </div>
                <button className="bookmark-modal-close" onClick={() => setModalQsInfo(null)}>×</button>
              </div>
      
              <div className="bookmark-modal-body">
                <div className="bookmark-modal-meta">UTME {formatName(qs.subject)} • {qs.topic}</div>
                <div className="bookmark-modal-question">
                  <Image id={qs.id} ext={qs.image?.url} />
                  {qs.question?.instruction && <><strong>{qs.question.instruction}</strong><br/></>}
                  {qs.question?.comprehension && <><strong dangerouslySetInnerHTML={{__html: qs.question.comprehension}} /><br/></>}
                  {!(typeof qs.question === 'object') ? qs.question : qs.question.qs}
                </div>
                <div className="bookmark-modal-options">
                  {
                    qs.options.map((opt) => 
                      (
                        <div className={`bookmark-modal-option ${qs.correctAnswers.includes(opt.id) && 'correct'}`} key={opt.id}>
                          <div className="bookmark-modal-option-key">{opt.id.toUpperCase()}</div>
                          <div dangerouslySetInnerHTML={{__html: opt.option}} />
                        </div>
                      )
                    )
                  }
                </div>
                <div className="bookmark-modal-answer">✓ Correct Answer: {qs.correctAnswers.join(' ').toUpperCase()}</div>
                <div className="bookmark-modal-explanation">
                  <div className="bookmark-modal-explanation-title">Explanation</div>{qs.explanation.text}
                </div>
              </div>
            </div>
          </div>
        )
      )
    }
    </>
  )
})


export function Bookmark() {
  const { userInfo } = useContext(UserContext)
  const [bookmarkData, setBookmarkData] = useState([])
  const [noBmkFound, setNoBmkFound] = useState(false)
  const [modalQsInfo, setModalQsInfo] = useState(null)
  const [controlledInput, setControlledInput] = useState('')
  const allBookmarkRef = useRef([])
  const subjectsBmkRef = useRef([])
  
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || []
    const data = bookmarks.filter(bmk => bmk.userId === userInfo._id)
    setBookmarkData(data)
    setNoBmkFound(data.length === 0 ? true : false)
    allBookmarkRef.current = data
    subjectsBmkRef.current = data
    
  },[setBookmarkData, setNoBmkFound])
  
  const complexSearch = useCallback((d, keyWord) => {
    if (d.question?.comprehension && d.question.comprehension.toLowerCase().includes(keyWord.toLowerCase())){
      return d.question.comprehension.toLowerCase().includes(keyWord.toLowerCase())
    } else if (d.question?.qs && d.question.qs.toLowerCase().includes(keyWord.toLowerCase())){
      return d.question.qs.toLowerCase().includes(keyWord.toLowerCase())
    } else if (d.question?.instruction){
      return d.question.instruction.toLowerCase().includes(keyWord.toLowerCase())
    } else if (typeof d.question !== 'object' && d.question.toLowerCase().includes(keyWord.toLowerCase())) {
      return d.question.toLowerCase().includes(keyWord.toLowerCase())
    } else {
      return d.topic.toLowerCase().includes(keyWord.toLowerCase())
    }
    
  },[])
  
  function searchBookmarked(event){
    const refreshBmkData = subjectsBmkRef.current
    const keyWord = event.target.value
    setControlledInput(keyWord)
    const searchResult = refreshBmkData.filter(d => complexSearch(d, keyWord) )
    if (searchResult.length <= 0){
      setNoBmkFound(true)
      setBookmarkData([])
      return
    }
    setNoBmkFound(false)
    setBookmarkData(searchResult)
  }
  
  const filterBySubject = useCallback((event) => {
    const filterValue = event.target.value
    setControlledInput('')
    const refreshBmkData = allBookmarkRef.current
    if (refreshBmkData.length <= 0){
      setNoBmkFound(true)
      return
    }
    if (filterValue === 'all'){
      subjectsBmkRef.current = refreshBmkData
      setNoBmkFound(false)
      setBookmarkData(refreshBmkData)
      return
    }
    const filterResult = refreshBmkData.filter(bmk => bmk.subject === filterValue)
    setNoBmkFound(filterResult.length <= 0 ? true : false)
    subjectsBmkRef.current = filterResult
    setBookmarkData(filterResult)
    
  },[allBookmarkRef, setNoBmkFound, setBookmarkData])
  

  function viewQuestion(qsId) {
    setModalQsInfo(bookmarkData.filter(bmk => bmk.id === qsId))
  }
  
  async function removeQuestion(qsId){
    const updatedBookmarks = allBookmarkRef.current.filter(b => b.id !== qsId)
    allBookmarkRef.current = updatedBookmarks
    subjectsBmkRef.current = subjectsBmkRef.current.filter(b => b.id !== qsId)
    const filter = bookmarkData.filter(b => b.id !== qsId)
    setBookmarkData(filter)
    setNoBmkFound(filter.length <= 0 || updatedBookmarks.length <= 0 ? true : false)
    localStorage.setItem('bookmarks', JSON.stringify(filter));
  }
  
  return (
    <>
      <title>Bookmarks | CBT Pro</title>

      <div className="bookmark-page">
        <nav className="nav">
          <div className="nav-container">
            <div className="nav-content">
              <Link className="logo" to="/">CBT Pro</Link>
            </div>
          </div>
        </nav>

        <div className="bookmark-header">
          <div className="nav-container">
            <h1>Bookmarked Questions</h1>
            <p>Review your saved CBT questions anytime</p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bookmark-toolbar">
          <input className="bookmark-search" placeholder="Search bookmarks by question or topic..." value={controlledInput} onChange={searchBookmarked} />
          <select className="bookmark-filter" onChange={filterBySubject}>
            <option value="all">All Subjects</option>
            {
            subjectsData.map(sub => 
              (
                <option value={sub.name} key={sub.id}>{formatName(sub.name)}</option>
              )
            )
          }
          </select>
        </div>

        {/* BOOKMARK LIST */}
        <div className="bookmark-container">
          {
            bookmarkData.length > 0 && bookmarkData.map(qs =>
            (
              <div className="bookmark-card" key={qs.id}>
                <div className="bookmark-content">
                  <div className="bookmark-question">
                    {qs.question?.instruction && <><strong>{qs.question.instruction}</strong><br/></>}
                    {qs.question?.comprehension && <><strong dangerouslySetInnerHTML={{__html: qs.question.comprehension}} /><br/></>}
                    {!(typeof qs.question === 'object') ? qs.question : qs.question.qs}
                  </div>
                  <div className="bookmark-badges">
                    <span className="bookmark-badge">{formatName(qs.subject)}</span>
                    <span className="bookmark-badge">{qs.topic}</span>
                  </div>
                </div>
                <div className="bookmark-actions">
                  <button className="bookmark-btn bookmark-btn-view" onClick={() => viewQuestion(qs.id)}>👁️ View</button>
                  <button className="bookmark-btn bookmark-btn-remove" onClick={() => removeQuestion(qs.id)}>🗑️ Remove</button>
                </div>
              </div>
            )
            )
          }

        </div>
        {
          noBmkFound && 
          (
            <div className="bookmark-empty">
              <div className="bookmark-empty-icon">🔍</div>
              <h3>No bookmarks found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )
        }
      </div>

      {/* BOOKMARK VIEW MODAL */}
      {modalQsInfo && <ExpensiveBmkModal modalQsInfo={modalQsInfo} setModalQsInfo={setModalQsInfo} />}

    </>
  )
}