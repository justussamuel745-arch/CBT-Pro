import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckboxDropdown } from '@/components/common/CheckboxDropdown'
import { DEFAULT_PAGE_SIZE, PAGE_SIZES, buildQuestionsPath } from '../utils/questionFilters'
import '@/components/common/FormControls.css'
import './PracticeConfigForm.css'

/* Topics, years and questions-per-page form for one subject (from getSubjectPage).
   Submitting opens the questions page for the selection (see buildQuestionsPath).
   Pass initialTopics / initialYears / initialSize to start from the current selection. */
export function PracticeConfigForm({
  subject,
  initialTopics = subject.topics,
  initialYears = subject.years,
  initialSize = DEFAULT_PAGE_SIZE,
}) {
  const navigate = useNavigate()

  const [topics, setTopics] = useState(initialTopics)
  const [years, setYears] = useState(initialYears)
  const [size, setSize] = useState(initialSize)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!topics.length || !years.length) {
      setError('Choose at least one topic and one year to continue.')
      return
    }
    setError('')
    navigate(buildQuestionsPath(subject, topics, years, size))
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
        <label className="ui-field-label" htmlFor="sp-page-size">Questions per page</label>
        <select
          id="sp-page-size"
          name="size"
          className="ui-field-control"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>{n} questions</option>
          ))}
        </select>
      </div>

      <div className="sp-config-actions">
        {error && <p className="sp-form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary">
          View questions <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
        <p className="sp-config-hint">No account needed. Create a free account to save your progress.</p>
      </div>
    </form>
  )
}
