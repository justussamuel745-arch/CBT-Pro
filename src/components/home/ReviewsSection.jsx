import { useState } from 'react'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeader } from '@/components/common/SectionHeader'
import { StarRating } from '@/components/common/StarRating'
import './ReviewsSection.css'

const MAX_LENGTH = 400
const EMPTY_FORM = { name: '', rating: 0, text: '' }

const initials = (name) =>
  name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

function ReviewCard({ review, index }) {
  return (
    <Reveal as="figure" index={index} className="review-card">
      <StarRating value={review.rating} />
      <blockquote>{review.text}</blockquote>
      <figcaption>
        <span className="review-avatar" aria-hidden="true">{initials(review.name)}</span>
        <span>
          <strong>{review.name}</strong>
          <small>{review.meta}</small>
        </span>
      </figcaption>
    </Reveal>
  )
}

/* Reviews list + submission form.
   `onSubmit(review)` should POST to your API and resolve/reject.
   Submitted reviews are NOT added to the list: show them after moderation. */
export function ReviewsSection({ reviews, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [error, setError] = useState('')

  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const update = (field) => (value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.text.trim().length < 20 || form.rating === 0) {
      setError('Add your name, a star rating, and at least 20 characters of feedback.')
      return
    }
    setError('')
    setStatus('submitting')
    try {
      await onSubmit({ ...form, name: form.name.trim(), text: form.text.trim() })
      setForm(EMPTY_FORM)
      setStatus('success')
    } catch {
      setStatus('error')
      setError('We could not send your review. Please try again.')
    }
  }

  return (
    <section className="home-section container" id="reviews">
      <SectionHeader
        title="What students say about CBT Pro"
        sub="Real practice, real progress. Here is how candidates describe their preparation."
      />

      {average && (
        <Reveal className="reviews-summary">
          <strong>{average}</strong>
          <StarRating value={Math.round(average)} />
          <span>from {reviews.length} reviews</span>
        </Reveal>
      )}

      <div className="reviews-grid">
        {reviews.map((review, i) => (
          <ReviewCard key={review.name} review={review} index={i} />
        ))}
      </div>

      <Reveal className="review-form-wrap">
        <h3>Share your experience</h3>
        <p>Used CBT Pro? Tell other candidates how it went. Reviews appear after a quick check.</p>

        {status === 'success' ? (
          <div className="review-success" role="status">
            <i className="fa-solid fa-circle-check"></i>
            Thank you! Your review was received and will appear once approved.
            <button type="button" className="demo-cta" onClick={() => setStatus('idle')}>
              Write another review
            </button>
          </div>
        ) : (
          <form className="review-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="review-name">Your name</label>
            <input
              id="review-name"
              type="text"
              maxLength={60}
              autoComplete="name"
              value={form.name}
              onChange={(e) => update('name')(e.target.value)}
            />

            <span className="review-label" id="review-rating-label">Your rating</span>
            <StarRating value={form.rating} onChange={update('rating')} label="Your rating" />

            <label htmlFor="review-text">Your review</label>
            <textarea
              id="review-text"
              rows={4}
              maxLength={MAX_LENGTH}
              value={form.text}
              onChange={(e) => update('text')(e.target.value)}
            />
            <small className="review-count">{form.text.length}/{MAX_LENGTH}</small>

            {error && <p className="review-error" role="alert">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending…' : 'Submit review'}
            </button>
          </form>
        )}
      </Reveal>
    </section>
  )
}
