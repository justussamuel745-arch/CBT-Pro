import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useSearchParams, useLocation } from "react-router";
import { toast } from 'react-hot-toast';
import scheduleSuccess from './ScheduleSuccess';
import { scheduledExamStore } from '../../stores/scheduledExamStore';
import { subjectsData } from '../../scripts/data/subjectsData';
import { formatName } from '../../scripts/utilis/formatName';
import { requestNotificationPermission } from '../../services/offlineNotificationService';
import "./ScheduleExam.css";

const SUBJECTS = subjectsData.map(sub => sub.name)

const COMPULSORY_SUBJECT = "English";

const DIFFICULTIES = [ "Easy", "Medium", "Hard", "Mixed" ];

const REMINDER_OPTIONS = [
  { value: "none", label: "None" },
  { value: "1h", label: "1 hour before" },
  { value: "12h", label: "12 hours before" },
  { value: "1d", label: "1 day before" },
  { value: "3d", label: "3 days before" },
  { value: "1w", label: "1 week before" },
];

const QUESTIONS_PER_SUBJECT = {
  English: 60,
  DEFAULT: 40,
};

function questionsForSubject(subject) {
  return QUESTIONS_PER_SUBJECT[ subject ] ?? QUESTIONS_PER_SUBJECT.DEFAULT;
}

function computeQuestionCount(subjects) {
  return subjects.reduce((sum, s) => sum + questionsForSubject(s), 0);
}

const DEFAULT_FORM = {
  name: "",
  date: "",
  time: "",
  subjects: [ COMPULSORY_SUBJECT ],
  numQuestions: computeQuestionCount([ COMPULSORY_SUBJECT ]),
  duration: 120,
  targetScore: 0,
  difficulty: "Mixed",
  shuffle: true,
  autoSubmit: true,
  reminder: "1d",
  notes: "Focus on speed and accuracy under exam conditions.",
};

const LIMITS = {
  duration: { min: 10, max: 300 },
};

const MARKS_PER_SUBJECT = 100;
const MIN_TARGET_PERCENT = 0.5;

const REMINDER_LEAD_MS = {
  none: 0,
  "1h": 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getTotalScore(subjects) {
  return subjects.length * MARKS_PER_SUBJECT;
}

function validate(form, isEdit) {
  const errors = {};
  const total = getTotalScore(form.subjects);

  if (!form.name.trim()) {
    errors.name = "Exam name is required.";
  } else if (form.name.trim().length > 60) {
    errors.name = "Keep the name under 60 characters.";
  }

  // Date: must be at least one full day away, checked on its own so it
  // can be shown immediately, even before a time is picked.
  if (!form.date) {
    errors.date = "Pick an exam date.";
  } else {
    const pickedDate = new Date(`${form.date}T00:00:00`);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (isNaN(pickedDate.getTime())) {
      errors.date = "That date doesn't look valid.";
    } else if (pickedDate.getTime() < tomorrow.getTime() && !isEdit) {
      errors.date = "Exam must be scheduled at least one day from now.";
    }
  }

  if (!form.time) {
    errors.time = "Pick an exam time.";
  }

  let examDateTime = null;
  if (form.date && form.time && !errors.date) {
    examDateTime = new Date(`${form.date}T${form.time}:00`);
    if (isNaN(examDateTime.getTime())) {
      errors.date = "That date/time doesn't look valid.";
      examDateTime = null;
    } else if ((examDateTime.getTime() - Date.now() < ONE_DAY_MS) && !isEdit) {
      errors.date = "Exam must be scheduled at least one day from now.";
      examDateTime = null;
    }
    const now = Date.now()
    const parsedExamDate = new Date(`${form.date}T${form.time}`).getTime()
    const lessThanNow = parsedExamDate < now
    if (lessThanNow) {
      errors.date = "Exam date and time cannot be less than your current date and time"
    }
  }

  if (form.subjects.length === 0) {
    errors.subjects = "Select at least one subject.";
  }

  if (form.duration === "" || form.duration === null) {
    errors.duration = "Enter a duration.";
  } else if (form.duration < LIMITS.duration.min) {
    errors.duration = `Exam time must be at least ${LIMITS.duration.min} minutes.`;
  } else if (form.duration > LIMITS.duration.max) {
    errors.duration = `Must be ${LIMITS.duration.max} minutes or less.`;
  } else if (form.numQuestions && form.duration / form.numQuestions < 0.5) {
    errors.duration = "That's under 30 seconds per question — consider more time.";
  }

  if (form.subjects.length === 0) {
    errors.targetScore = "Select subjects to set a target score.";
  } else if (form.targetScore === "" || form.targetScore === null) {
    errors.targetScore = "Enter a target score.";
  } else if (form.targetScore < 0 || form.targetScore > total) {
    errors.targetScore = `Must be between 0 and ${total} (based on ${form.subjects.length} subject${form.subjects.length > 1 ? "s" : ""
      }).`;
  } else if (form.targetScore < total * MIN_TARGET_PERCENT) {
    errors.targetScore = `Target must be at least ${Math.ceil(
      total * MIN_TARGET_PERCENT
    )} (50% of ${total}).`;
  }

  if (examDateTime && form.reminder !== "none") {
    const lead = REMINDER_LEAD_MS[ form.reminder ] ?? 0;
    if (examDateTime.getTime() - Date.now() < lead) {
      errors.reminder = "Exam is too soon for this reminder — pick a shorter lead time.";
    }
  }

  return errors;
}


const formatDateTimeForInputs = (mongoDate) => {
  const date = new Date(mongoDate);

  if (Number.isNaN(date.getTime())) {
    return {
      date: '',
      time: '',
    };
  }

  const pad = (value) => String(value).padStart(2, '0');

  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export default function ScheduleExam() {
  const upcomingExams = scheduledExamStore(state => state.upcomingExams)
  const saveScheduledExam = scheduledExamStore(state => state.saveScheduledExam);
  const saveEditedSchedule = scheduledExamStore(state => state.saveEditedSchedule)
  const onChangeStatus = scheduledExamStore(state => state.onChangeStatus)
  const setMissedExams = scheduledExamStore(state => state.setMissedExams)

  const { state } = useLocation()

  const [ searchParams ] = useSearchParams()
  const examId = searchParams.get('examId')

  const initialValues = useMemo(() => {
    if (!examId && !state?.initialValues) return null;

    const exam =
      state?.initialValues ??
      upcomingExams.find(e => e._id === examId);

    if (!exam) return null;

    const { examDate = "", ...otherValues } = exam;

    return {
      ...otherValues,
      ...formatDateTimeForInputs(examDate),
    };
  }, [ examId, state?.initialValues, upcomingExams ]);

  const isEdit = Boolean(examId && initialValues);
  const isReschedule = Boolean(state?.initialValues)

  const [ form, setForm ] = useState(initialValues || DEFAULT_FORM);
  const [ errors, setErrors ] = useState({});
  const [ serverError, setServerError ] = useState(null)
  const [ submitted, setSubmitted ] = useState(false);
  const [ isOffline, setIsOffline ] = useState(false);
  const [ scheduleSuccess, setScheduleSuccess ] = useState(null)
  const [ modal, setModal ] = useState(null)


  const total = getTotalScore(form.subjects);
  const scheduleButtonRef = useRef(null)

  const isFormComplete =
    form.name.trim() !== "" &&
    form.date !== "" &&
    form.time !== "" &&
    form.subjects?.length > 0 &&
    form.targetScore !== "" &&
    form.targetScore !== null;

  function update(field, value) {
    setServerError(null)
    setForm((prev) => {
      const next = { ...prev, [ field ]: value };
      // Errors always stay current internally, but most fields only
      // *display* their error after the person clicks Schedule Exam.
      // The date is the one exception — it validates live.
      if (field === 'date' || field === 'time') {
        setErrors(validate(next, isEdit));
      }
      return next;
    });
  }

  function toggleSubject(subject) {
    if (subject === COMPULSORY_SUBJECT) return; // English is compulsory, can't be removed

    setForm((prev) => {
      const has = prev.subjects.includes(subject);
      const nextSubjects = has
        ? prev.subjects.filter((s) => s !== subject)
        : [ ...prev.subjects, subject ];
      const next = {
        ...prev,
        subjects: nextSubjects,
        numQuestions: computeQuestionCount(nextSubjects),
      };
      setErrors(validate(next, isEdit));
      return next;
    });
  }

  async function onSave() {
    const examDate = `${form.date}T${form.time}`;

    const updatedForm = {
      ...form,
      examDate,
    };

    delete updatedForm.date;
    delete updatedForm.time;

    try {
      if (import.meta.env.VITE_ENV !== 'development') {
        const allowed = await requestNotificationPermission().catch(() => false);

        console.log('Allowed:', allowed);
        console.log('Permission:', Notification.permission);
      }

      await toast.promise(saveScheduledExam(updatedForm), {
        loading: 'Scheduling Exam...',
        success: 'Exam Scheduled.',
        error: false,
      });

      setScheduleSuccess(updatedForm);
    } catch (err) {
      if (!err?.status) {
        setServerError(
          'Couldn\'t reach the server. Check your internet connection and try again'
        );
      } else if (err.status >= 500) {
        setServerError('Something went wrong.');
      } else {
        setServerError(err.error);
      }
    } finally {
      const btnElement = scheduleButtonRef.current;

      if (btnElement) {
        btnElement.style.opacity = '1';
        btnElement.innerHTML = `
        ${isEdit ? 'Save Changes' : 'Schedule Exam'}
      `;
      }
    }
  }

  function onSaveEdit() {
    const examDate = `${form.date}T${form.time}`
    const updatedForm = {
      ...form,
      examDate
    }
    delete updatedForm.date
    delete updatedForm.time
    toast.promise(saveEditedSchedule(updatedForm, '?action=edit'), {
      loading: 'Editing...',
      success: 'Edited.',
      error: false
    }).catch((err) => {
      if (!err.status) {
        setServerError('Couldn\'t reach the server. Check your internet connection and try again')
      } else if (err.status >= 500) {
        setServerError('Something went wrong.')
      } else {
        setServerError(err.error)
      }
    }).finally(() => {
      const btnElement = scheduleButtonRef.current
      btnElement.style.opacity = '1'
      btnElement.innerHTML = `
        ${isEdit ? 'Save Changes' : 'Schedule Exam'}
      `
    })
  }

  function onReschedule() {
    const examDate = `${form.date}T${form.time}`
    const updatedForm = {
      ...form,
      examDate
    }
    delete updatedForm.date
    delete updatedForm.time
    toast.promise((async () => {
      await onChangeStatus(form._id, 'scheduled')
      await saveEditedSchedule(updatedForm, '?action=reschedule')
    })(), {
      loading: 'Rescheduling...',
      success: 'Rescheduled',
      error: false
    }).then(() => {
      setMissedExams(prev => prev.filter(e => e._id !== form._id))
    }).catch((err) => {
      if (!err.status) {
        setServerError('Couldn\'t reach the server. Check your internet connection and try again')
      } else if (err.status >= 500) {
        setServerError('Something went wrong.')
      } else {
        setServerError(err.error)
      }
    }).finally(() => {
      const btnElement = scheduleButtonRef.current
      btnElement.style.opacity = '1'
      btnElement.innerHTML = `
        ${isEdit ? 'Save Changes' : 'Schedule Exam'}
      `
    })

  }



  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(form, isEdit);
    setErrors(nextErrors);
    setSubmitted(true);

    if (Object.keys(nextErrors).length > 0) {
      const firstField = Object.keys(nextErrors)[ 0 ];
      const el =
        document.getElementById(firstField) || document.getElementById(`${firstField}Group`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }



    const btnElement = scheduleButtonRef.current
    btnElement.style.opacity = '0.5'
    btnElement.innerHTML = `
      <i className="fa-solid fa-calendar-check" aria-hidden="true"></i>
      ${isEdit ? 'Editing...' : 'Scheduling...'}
    `

    if (isEdit) {
      onSaveEdit()
    } else if (isReschedule) {
      onReschedule()
    } else {
      onSave()
    }

  }

  // Date shows its error live; every other field waits until submit.
  function fieldError(field) {
    if (field === "date") return errors.date || null;
    return submitted && errors[ field ] ? errors[ field ] : null;
  }

  if (scheduleSuccess) return <ScheduleSuccess exam={scheduleSuccess} />

  return (
    <div className="examform-page no-select">
      {/* Header */}
      <header className="examform-header">
        <Link className="examform-back" to="/exam-planner" aria-label="Go back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </Link>
        <div>
          <h1 className="examform-header__title">
            {isEdit ? "Edit Exam" : "Schedule New Exam"}
          </h1>
          <p className="examform-header__subtitle">
            Set up a personal mock exam and work toward a target score.
          </p>
        </div>
      </header>

      <form className="examform-form" onSubmit={handleSubmit} noValidate>
        {/* Basic details */}
        <section className="examform-section">
          <h2 className="examform-section__title">Exam Details</h2>

          <div className="examform-field">
            <label className="examform-label" htmlFor="name">
              Exam Name
            </label>
            <input
              id="name"
              type="text"
              className={`examform-input${fieldError("name") ? " examform-input--error" : ""}`}
              placeholder="e.g. JAMB Mock 1"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              aria-invalid={Boolean(fieldError("name"))}
              aria-describedby={fieldError("name") ? "name-error" : undefined}
            />
            {fieldError("name") && (
              <p className="examform-error" id="name-error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                {fieldError("name")}
              </p>
            )}
          </div>

          <div className="examform-row">
            <div className="examform-field">
              <label className="examform-label" htmlFor="date">
                Exam Date
              </label>
              <input
                id="date"
                type="date"
                className={`examform-input${fieldError("date") ? " examform-input--error" : ""}`}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                aria-invalid={Boolean(fieldError("date"))}
                aria-describedby={fieldError("date") ? "date-error" : undefined}
              />
              {fieldError("date") && (
                <p className="examform-error" id="date-error">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                  {fieldError("date")}
                </p>
              )}
            </div>

            <div className="examform-field">
              <label className="examform-label" htmlFor="time">
                Exam Time
              </label>
              <input
                id="time"
                type="time"
                className={`examform-input${fieldError("time") ? " examform-input--error" : ""}`}
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                aria-invalid={Boolean(fieldError("time"))}
                aria-describedby={fieldError("time") ? "time-error" : undefined}
              />
              {fieldError("time") && (
                <p className="examform-error" id="time-error">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                  {fieldError("time")}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Subjects */}
        <section className="examform-section">
          <h2 className="examform-section__title">Subjects</h2>
          <p className="examform-section__hint">
            English is compulsory. Select any other subjects to include.
          </p>

          <div
            id="subjectsGroup"
            className={`examform-subjects${fieldError("subjects") ? " examform-subjects--error" : ""
              }`}
          >
            {SUBJECTS.map((subject) => {
              const checked = form.subjects.includes(subject);
              const isCompulsory = subject === COMPULSORY_SUBJECT;
              return (
                <label
                  key={subject}
                  className={`examform-subject${checked ? " examform-subject--checked" : ""}${isCompulsory ? " examform-subject--locked" : ""
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isCompulsory}
                    onChange={() => toggleSubject(subject)}
                  />
                  <span className="examform-subject__row">
                    <span className="examform-subject__check">
                      <i className="fa-solid fa-check" aria-hidden="true"></i>
                    </span>
                    <span className="examform-subject__name">{formatName(subject)}</span>
                  </span>
                  {isCompulsory && (
                    <span className="examform-subject__badge">Compulsory</span>
                  )}
                </label>
              );
            })}
          </div>
          {fieldError("subjects") && (
            <p className="examform-error">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
              {fieldError("subjects")}
            </p>
          )}
        </section>

        {/* Exam settings */}
        <section className="examform-section">
          <h2 className="examform-section__title">Exam Settings</h2>

          <div className="examform-row">
            <div className="examform-field">
              <span className="examform-label">Number of Questions</span>
              <div className="examform-readout">
                <span className="examform-readout__value">{form.numQuestions}</span>
                <i className="fa-solid fa-lock" aria-hidden="true"></i>
              </div>
              <p className="examform-hint">
                English: 60 · Others: 40 each — set by your subject choices
              </p>
            </div>

            <div className="examform-field">
              <label className="examform-label" htmlFor="duration">
                Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                min={LIMITS.duration.min}
                max={LIMITS.duration.max}
                className={`examform-input${fieldError("duration") ? " examform-input--error" : ""
                  }`}
                value={form.duration}
                onChange={(e) =>
                  update("duration", e.target.value === "" ? "" : Number(e.target.value))
                }
                aria-invalid={Boolean(fieldError("duration"))}
                aria-describedby={fieldError("duration") ? "duration-error" : undefined}
              />
              {fieldError("duration") && (
                <p className="examform-error" id="duration-error">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                  {fieldError("duration")}
                </p>
              )}
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
                max={total || undefined}
                disabled={total === 0}
                className={`examform-input${fieldError("targetScore") ? " examform-input--error" : ""
                  }`}
                value={form.targetScore}
                onChange={(e) =>
                  update("targetScore", e.target.value === "" ? "" : Number(e.target.value))
                }
                aria-invalid={Boolean(fieldError("targetScore"))}
                aria-describedby={fieldError("targetScore") ? "targetScore-error" : undefined}
              />
              <span className="examform-target__max">/ {total || "—"}</span>
            </div>
            {!fieldError("targetScore") && total > 0 && (
              <p className="examform-hint">
                {form.subjects.length} subject{form.subjects.length > 1 ? "s" : ""} ×{" "}
                {MARKS_PER_SUBJECT} marks · min target {Math.ceil(total * MIN_TARGET_PERCENT)}
              </p>
            )}
            {fieldError("targetScore") && (
              <p className="examform-error" id="targetScore-error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                {fieldError("targetScore")}
              </p>
            )}
          </div>

          <div className="examform-field">
            <span className="examform-label">Difficulty</span>
            <div className="examform-segmented">
              {DIFFICULTIES.map((level) => (
                <button
                  type="button"
                  key={level}
                  className={`examform-segmented__btn${form.difficulty === level ? " examform-segmented__btn--active" : ""
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
              <div className="examform-toggle-row__hint">
                Always on — matches real JAMB behavior
              </div>
            </div>
            <span className="examform-switch examform-switch--locked" aria-hidden="true">
              <span className="examform-switch__track examform-switch__track--on">
                <i className="fa-solid fa-lock examform-switch__lock" aria-hidden="true"></i>
              </span>
            </span>
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
            {fieldError("reminder") && (
              <p className="examform-error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                {fieldError("reminder")}
              </p>
            )}
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
          <div className="examform-footer__inner">
            {submitted && Object.keys(errors).length > 0 && (
              <p className="examform-form-error">
                <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                Please fix the highlighted fields before saving.
              </p>
            )}
            {serverError && Object.keys(errors).length === 0 &&
              (
                <p className="examform-form-error">
                  <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                  {serverError}
                </p>
              )
            }
            <button
              type="submit"
              className="examform-save"
              ref={scheduleButtonRef}
              disabled={!isFormComplete || (isEdit && initialValues === form)}
              aria-disabled={!isFormComplete}
            >
              <i className="fa-solid fa-calendar-check" aria-hidden="true"></i>
              {isEdit ? 'Save Changes' : 'Schedule Exam'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}