import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router';
import UserContext from '../context/UserContext.jsx';
import { fetchWithAuth } from '../scripts/utilis/fetch.js'
import { ToastProvider, useToast, CSS } from '../components/NotificationSystem';
import './Feedback.css';

function FeedbackInner(){
  const { token, setToken, error, setError } = useContext(UserContext);
  const [ feedbackType, setFeedbackType ] = useState('')
  const [feedbackComment, setFeedbackComment ] = useState('')
  const [ isDisabled, setIsDisabled ] = useState(false)
  const [ formContainer, setFormContainer ] = useState('show')
  
  const toast = useToast()
  
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);
  
  async function submitForm(event){
    event.preventDefault()
    setError(null)
    if (!feedbackType){
      setError({
        feild: 'feedbackType',
        message: 'Please select a feedback type'
      })
      return
    }
    
    if (feedbackComment.length < 10) {
      setError({
        feild: 'feedbackComment',
        message: 'Please write at least 10 characters'
      })
      return;
    }
    
    setIsDisabled(true)
    
    const formData = {
      feedbackType,
      message: feedbackComment
    }
    
    try {
      const response = await fetchWithAuth(token, setToken, '/api/feedback', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      if (!response.ok){
        throw { status: response.status }
      }
      setFormContainer('hide')
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (!err.status) {
        toast.push({ variant: 'pill', type: 'error', message: "Network Error. Check your connection or try again later" });
      } else if (err.status >= 500) {
        toast.push({ variant: 'pill', type: 'error', message: "Something went wrong. Please try again later" });
      }
      console.error('Error:', err);
    }
  }
  
  function getFeedbackType(event){
    setFeedbackType(event.target.value)
  }
  
  function getFeedbackComment(event){
    setFeedbackComment(event.target.value)
  }
  
  return (
    <>
      <title>Send Feedback | CBT Pro</title>
      
      <div className="feedback-page">
        <nav className="nav">
          <div className="nav-container">
            <div className="nav-content">
              <Link to="/" className="logo">CBT Pro</Link>
              <div className="nav-links">
              </div>
            </div>
          </div>
        </nav>
    
        <div className="page-header">
          <div className="nav-container">
            <div className="breadcrumb">
              <Link to="/">Home</Link> / Feedback
            </div>
            <h1>Send Feedback</h1>
            <p className="page-subtitle">Help us improve CBT Pro. We read every message.</p>
          </div>
        </div>
    
        <main className="feedback-main">
          <div className="feedback-container">
            
            {/* FEEDBACK FORM */}
            <div className={`feedback-card ${formContainer === 'show' ? '' : 'd-none'}`} >
              <form className="feedback-form">
                
                {/* FEEDBACK TYPE */}
                <div className="feedback-form-group">
                  <label className="feedback-label" htmlFor="feedbackType">
                    Feedback Type <span className="feedback-required">*</span>
                  </label>
                  <select className="feedback-select" name="feedbackType" onChange={getFeedbackType} required>
                    <option value="">Select feedback type...</option>
                    <option value="Business">Business</option>
                    <option value="Technical Issues">Technical Issues</option>
                    <option value="Pricing">Pricing</option>
                    <option value="General">General</option>
                  </select>
                  {(error && (typeof error === 'object') && (error.feild === 'feedbackType') && <div className="feedback-error">{error.message}</div>) || <div className="feedback-hint">Choose the option that best describes your feedback</div> }
                </div>
    
                {/* FEEDBACK COMMENT */}
                <div className="feedback-form-group">
                  <label className="feedback-label" htmlFor="feedbackComment">
                    <span>✍️</span>
                    Your Feedback <span className="feedback-required">*</span>
                  </label>
                  <textarea
                    className="feedback-textarea"
                    name="feedbackComment"
                    placeholder="Tell us what's on your mind... For bugs, please include steps to reproduce the issue."
                    required
                    minLength="10"
                    onChange={getFeedbackComment}
                  ></textarea>
                  {(error && (typeof error === 'object') && (error.feild === 'feedbackComment') && <div className="feedback-error">{error.message}</div>) || <div className="feedback-hint">Minimum 10 characters. Be as detailed as possible.</div> }
                </div>
    
                {/* SUBMIT */}
                <button type="submit" className="feedback-submit" onClick={submitForm} disabled={isDisabled}>
                  <span>{!isDisabled ? '📤' : '⏳'}</span>
                  {!isDisabled ? 'Submit Feedback' : 'Sending...'}
                </button>
              </form>
            </div>
    
            {/* SUCCESS MESSAGE */}
            <div className={`feedback-success ${formContainer === 'hide' && 'show'}`}>
              <div className="feedback-success-icon">✓</div>
              <h2 className="feedback-success-title">Thank You!</h2>
              <p className="feedback-success-text">
                Your feedback has been received. We appreciate you taking the time to help us improve CBT Pro.
              </p>
              <Link to="/" className="feedback-btn-secondary">
                <span>🏠</span>
                Back to Home
              </Link>
            </div>
    
          </div>
        </main>
      </div>
    </>
  )
}

export function Feedback() {
  return (
    <ToastProvider position="top-right">
      <FeedbackInner />
    </ToastProvider>
  );
}