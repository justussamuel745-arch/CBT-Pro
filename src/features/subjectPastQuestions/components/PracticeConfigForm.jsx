import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckboxDropdown } from '@/components/common/CheckboxDropdown'
import { authStore } from '@/stores/authStore'
import { studyStore } from '@/stores/studyStore'
import '@/components/common/FormControls.css'
import './PracticeConfigForm.css'

const QUESTION_COUNTS = [10, 20, 40, 60]

/* Topics, years and number-of-questions form for one subject (from getSubjectPage). */
export function PracticeConfigForm({ subject }) {
  const navigate = useNavigate()
  const token = authStore((state) => state.token)
  const isActivated = authStore((state) => state.isActivated)
  const setStudyConfig = studyStore((state) => state.setStudyConfig)

  // Everything starts selected, like the Study configuration screen
  const [topics, setTopics] = useState(subject.topics)
  const [years, setYears] = useState(subject.years)
  const [count, setCount] = useState(subject.slug === 'english' ? 60 : 40)
  const [error, setError] = useState('')

  // Placeholder destination. When clean practice URLs exist, replace the
  // navigate() calls below with the clean URL built from topics, years and count.
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!topics.length || !years.length) {
      setError('Choose at least one topic and one year to continue.')
      return
    }
    setError('')

    if (!token) return navigate('/auth/signup')
    if (!isActivated) return navigate('/payment')

    setStudyConfig({ subject: subject.rawName, years, topics, shuffle: true })
    navigate('/study-simulator?mode=study', { state: { questionCount: count } })
  }

  return (
    <form className="sp-config" onSubmit={handleSubmit} noValidate>
      <CheckboxDropdown
        label="Topics"
        noun="topic"
        options={subject.topicOptions}
        selected={topics}
        onChange={setTopics}
        searchable
      />
      <CheckboxDropdown
        label="Years"
        noun="year"
        options={subject.yearOptions}
        selected={years}
        onChange={setYears}
      />
      <div className="sp-field">
        <label className="ui-field-label" htmlFor="sp-question-count">Number of questions</label>
        <select
          id="sp-question-count"
          name="count"
          className="ui-field-control"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        >
          {QUESTION_COUNTS.map((n) => (
            <option key={n} value={n}>{n} questions</option>
          ))}
        </select>
      </div>

      <div className="sp-config-actions">
        {error && <p className="sp-form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Start practicing <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
        <p className="sp-config-hint">Browse as a guest, or create a free account to save your progress.</p>
      </div>
    </form>
  )
}
