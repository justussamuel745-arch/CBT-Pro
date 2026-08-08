import { useState } from "react";
import "./ScheduleExam.css";

const SUBJECTS = [
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Government",
  "Economics",
  "Literature",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];

const REMINDER_OPTIONS = [
  { value: "none", label: "None" },
  { value: "1h", label: "1 hour before" },
  { value: "12h", label: "12 hours before" },
  { value: "1d", label: "1 day before" },
  { value: "3d", label: "3 days before" },
  { value: "1w", label: "1 week before" },
];

const DEFAULT_FORM = {
  name: "",
  date: "",
  time: "",
  subjects: [],
  numQuestions: 40,
  duration: 120,
  targetScore: 250,
  difficulty: "Medium",
  shuffle: true,
  autoSubmit: true,
  reminder: "1d",
  notes: "",
};

export default function ScheduleExam({
  initialValues = null,
  onSave = () => {},
  onBack = () => {},
}) {
  const [form, setForm] = useState(initialValues || DEFAULT_FORM);
  const isEdit = Boolean(initialValues);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSubject(subject) {
    setForm((prev) => {
      const has = prev.subjects.includes(subject);
      return {
        ...prev,
        subjects: has
          ? prev.subjects.filter((s) => s !== subject)
          : [...prev.subjects, subject],
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const isValid = form.name.trim() && form.date && form.time && form.subjects.length > 0;

  return (
    <div className="examform-page no-select">
      {/* Header */}
      <header className="examform-header">
        <button className="examform-back" onClick={onBack} aria-label="Go back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </button>
        <div>
          <h1 className="examform-header__title">
            {isEdit ? "Edit Exam" : "Schedule New Exam"}
          </h1>
          <p className="examform-header__subtitle">
            Set up a personal mock exam and work toward a target score.
          </p>
        </div>
      </header>

      <form className="examform-form" onSubmit={handleSubmit}>
        {/* Basic details */}
        <section className="examform-section">
          <h2 className="examform-section__title">Exam Details</h2>

          <div className="examform-field">
            <label className="examform-label" htmlFor="examName">
              Exam Name
            </label>
            <input
              id="examName"
              type="text"
              className="examform-input"
              placeholder="e.g. JAMB Mock 1"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="examform-row">
            <div className="examform-field">
              <label className="examform-label" htmlFor="examDate">
                Exam Date
              </label>
              <input
                id="examDate"
                type="date"
                className="examform-input"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>

            <div className="examform-field">
              <label className="examform-label" htmlFor="examTime">
                Exam Time
              </label>
              <input
                id="examTime"
                type="time"
                className="examform-input"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Subjects */}
        <section className="examform-section">
          <h2 className="examform-section__title">Subjects</h2>
          <p className="examform-section__hint">Select the subjects to include.</p>

          <div className="examform-subjects">
            {SUBJECTS.map((subject) => {
              const checked = form.subjects.includes(subject);
              return (
                <label
                  key={subject}
                  className={`examform-subject${checked ? " examform-subject--checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSubject(subject)}
                  />
                  <span className="examform-subject__check">
                    <i className="fa-solid fa-check" aria-hidden="true"></i>
                  </span>
                  {subject}
                </label>
              );
            })}
          </div>
        </section>

        {/* Exam settings */}
        <section className="examform-section">
          <h2 className="examform-section__title">Exam Settings</h2>

          <div className="examform-row">
            <div className="examform-field">
              <label className="examform-label" htmlFor="numQuestions">
                Number of Questions
              </label>
              <input
                id="numQuestions"
                type="number"
                min="1"
                className="examform-input"
                value={form.numQuestions}
                onChange={(e) => update("numQuestions", Number(e.target.value))}
              />
            </div>

            <div className="examform-field">
              <label className="examform-label" htmlFor="duration">
                Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                min="1"
                className="examform-input"
                value={form.duration}
                onChange={(e) => update("duration", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="examform-field">
            <label className="examform-label" htmlFor="targetScore">
              Target Score
            </label>
            <div className="examform-target">
              <input
                id="targetScore"
                type="number"
                min="0"
                max="400"
                className="examform-input"
                value={form.targetScore}
                onChange={(e) => update("targetScore", Number(e.target.value))}
              />
              <span className="examform-target__max">/ 400</span>
            </div>
          </div>

          <div className="examform-field">
            <span className="examform-label">Difficulty</span>
            <div className="examform-segmented">
              {DIFFICULTIES.map((level) => (
                <button
                  type="button"
                  key={level}
                  className={`examform-segmented__btn${
                    form.difficulty === level ? " examform-segmented__btn--active" : ""
                  }`}
                  onClick={() => update("difficulty", level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="examform-toggle-row">
            <div>
              <div className="examform-toggle-row__label">Shuffle Questions</div>
              <div className="examform-toggle-row__hint">Randomize question order</div>
            </div>
            <label className="examform-switch">
              <input
                type="checkbox"
                checked={form.shuffle}
                onChange={(e) => update("shuffle", e.target.checked)}
              />
              <span className="examform-switch__track"></span>
            </label>
          </div>

          <div className="examform-toggle-row">
            <div>
              <div className="examform-toggle-row__label">Auto Submit</div>
              <div className="examform-toggle-row__hint">Submit automatically when time is up</div>
            </div>
            <label className="examform-switch">
              <input
                type="checkbox"
                checked={form.autoSubmit}
                onChange={(e) => update("autoSubmit", e.target.checked)}
              />
              <span className="examform-switch__track"></span>
            </label>
          </div>
        </section>

        {/* Reminder & notes */}
        <section className="examform-section">
          <h2 className="examform-section__title">Reminder & Notes</h2>

          <div className="examform-field">
            <label className="examform-label" htmlFor="reminder">
              Reminder
            </label>
            <select
              id="reminder"
              className="examform-select"
              value={form.reminder}
              onChange={(e) => update("reminder", e.target.value)}
            >
              {REMINDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="examform-field">
            <label className="examform-label" htmlFor="notes">
              Notes <span className="examform-optional">(Optional)</span>
            </label>
            <textarea
              id="notes"
              className="examform-textarea"
              placeholder="Focus on speed."
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </section>

        {/* Save */}
        <div className="examform-footer">
          <button
            type="submit"
            className="examform-save"
            disabled={!isValid}
          >
            <i className="fa-solid fa-calendar-check" aria-hidden="true"></i>
            Schedule Exam
          </button>
        </div>
      </form>
    </div>
  );
}
