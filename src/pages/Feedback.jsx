import { useState } from 'react'
import { Link } from 'react-router';
import { toast } from 'react-hot-toast';
import { request } from '../scripts/utilis/request';
import './Feedback.css';

export default function Feedback(){
  const [feedbackType, setFeedbackType] = useState('')
  const [feedbackComment, setFeedbackComment ] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)
  const [formContainer, setFormContainer] = useState('show')
  const [error, setError] = useState(null)
  
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
      await request.auth('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setFormContainer('hide')
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (!err.status) {
        toast.error("Couldn't connect to the server.");
      } else if (err.status >= 500) {
        toast.error("Unexpected error. Try again later");
      } else {
        toast.error('Failed')
      }
    } finally {
      setIsDisabled(false)
    }
  }
  
  return (
    <>
      <title>Send Feedback | CBT Pro</title>
      
      <div className="feedback-page">
        <nav className="nav">
          <div className="nav-container">
            <div className="nav-content">
              <Link to="/" onClick={() => toast.dismiss()} className="logo">CBT Pro</Link>
              <div className="nav-links">
              </div>
            </div>
          </div>
        </nav>
    
        <div className="page-header">
          <div className="nav-container">
            <div className="breadcrumb">
              <Link to="/" onClick={() => toast.dismiss()}>Dashboard</Link> / Feedback
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
                  <select className="feedback-select" name="feedbackType" onChange={(e) => setFeedbackType(e.target.value)} required>
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
                    onChange={(e) => setFeedbackComment(e.target.value)}
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