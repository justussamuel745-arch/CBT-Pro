import { SUBJECTS_DATA } from '@/lib/data/subjects'
import { formatName } from '@/lib/utils/formatName'
import { ACTIVATION_PRICE } from '@lib/config/app.js'

/* ---------- Subjects (built from your real subject data) ---------- */

// Same slug rule as SUBJECTS in homeContent.js, so Home and this page link to the same URLs.
export const subjectSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// subjects.js stores the image as an <img> HTML string; pull out the src so we can add alt text.
const iconSrc = (html) => (typeof html === 'string' ? html.match(/src="([^"]+)"/)?.[1] : null) ?? null

export const SUBJECT_LIST = SUBJECTS_DATA
  .filter((s) => s.id !== 'LEKKI001')
  .map((s) => ({
    id: s.id,
    name: formatName(s.name),
    slug: subjectSlug(s.name),
    total: s.totalQuestions ?? 0,
    category: String(s.category ?? 'all').toLowerCase(),
    image: iconSrc(s.icon),
  }))

const TOTAL = SUBJECT_LIST.reduce((sum, s) => sum + s.total, 0)
// Rounded down so the page never over-promises, e.g. 22,797 -> "22,000+"
export const TOTAL_QUESTIONS_LABEL = `${(Math.floor(TOTAL / 1000) * 1000).toLocaleString()}+`

export const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Science', value: 'science' },
  { label: 'Arts', value: 'arts' },
  { label: 'Commercial', value: 'commercial' },
]

// Subjects tagged "all" (e.g. English) are compulsory/general, so they show under every filter.
export const matchesFilter = (subject, filter) =>
  filter === 'all' || subject.category.includes('all') || subject.category.includes(filter)

/* ---------- Page copy ---------- */

export const BENEFITS = [
  { icon: 'fa-bullseye', title: 'Learn the exam pattern', desc: 'Past questions show the topics and question styles JAMB likes to ask, so you can aim your reading where it counts.' },
  { icon: 'fa-stopwatch', title: 'Build speed and accuracy', desc: 'Answering real-style questions against the clock trains you to work fast without losing marks to careless mistakes.' },
  { icon: 'fa-magnifying-glass-chart', title: 'Find your weak topics', desc: 'Every wrong answer points to a gap. Fix those topics early instead of discovering them on exam day.' },
  { icon: 'fa-lightbulb', title: 'Understand, not memorize', desc: 'Explanations show why an answer is right, which helps you handle new questions you have never seen.' },
  { icon: 'fa-face-smile', title: 'Reduce exam-day anxiety', desc: 'The more familiar the questions and format feel, the calmer you are when the real paper opens.' },
  { icon: 'fa-list-check', title: 'Revise the syllabus actively', desc: 'Testing yourself beats rereading notes. Practice turns passive revision into real recall.' },
]

export const HOW_STEPS = [
  { icon: 'fa-hand-pointer', title: 'Pick a subject', desc: 'Choose any subject from the list above. Start with the ones you find hardest.' },
  { icon: 'fa-sliders', title: 'Choose your topics and years', desc: 'In Study Mode, focus on a single weak topic or mix several years together.' },
  { icon: 'fa-chart-line', title: 'Review and improve', desc: 'Read each explanation, ask Astra AI when stuck, and track your progress over time.' },
]

export const WHY_POINTS = [
  { icon: 'fa-circle-check', title: 'Explanations that teach', desc: 'Our questions come with explanations, so every practice session doubles as a lesson.' },
  { icon: 'fa-robot', title: 'Astra AI when you are stuck', desc: 'Ask for a step-by-step breakdown of any question, day or night.' },
  { icon: 'fa-laptop-code', title: 'Study Mode and real CBT Practice Mode', desc: 'Learn with instant feedback, then test yourself in a timed, JAMB-style simulation.' },
  { icon: 'fa-wifi', title: 'Works on your phone, even offline', desc: 'Install CBT Pro as an app and keep practicing with little or no data.' },
]

export const PAGE_FAQS = [
  { q: 'What are JAMB past questions?', a: 'They are questions that appeared in earlier JAMB UTME papers. Practicing them shows you the topics, wording and difficulty you should expect in the real exam.' },
  { q: 'Are past questions enough to pass JAMB?', a: 'They are one of the most effective tools, but work best alongside the official syllabus and your textbooks. Use past questions to test what you have studied and to find what you still need to learn.' },
  { q: 'How should I practice JAMB past questions?', a: 'Start with one subject, practice topic by topic in Study Mode, and read every explanation. Closer to the exam, switch to timed Practice Mode to build speed and stamina.' },
  { q: 'Do the past questions come with explanations?', a: 'Yes. Questions on CBT Pro come with explanations, and the Astra AI Tutor can break down any question further.' },
  { q: 'Can I browse past questions without an account?', a: 'Yes. You can browse as a guest. A free account lets you save your progress, and full access to every question, subject and CBT feature is available with the yearly subscription.' },
  { q: 'How much does full access cost?', a: `Full access is a ₦${ACTIVATION_PRICE} yearly subscription covering unlimited practice across every question and subject for a full year.` },
  { q: 'Which subjects can I practice?', a: 'You can practice every subject listed on this page, including Use of English, Mathematics, the sciences, the arts and the commercial subjects.' },
]
