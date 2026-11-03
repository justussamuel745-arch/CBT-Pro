import { ACTIVATION_PRICE } from '@lib/config/app.js'
import { SUBJECTS_DATA } from '@/lib/data/subjects'

// TODO: update to the real confirmed JAMB UTME date each year
export const NEXT_UTME_DATE = new Date('2027-04-01')

export const FEATURES = [
  { icon: 'fa-laptop-code', title: 'Real CBT Simulator', desc: 'The exact JAMB layout, on-screen calculator, countdown timer and auto-submit — so nothing feels new on exam day.' },
  { icon: 'fa-robot', title: 'Astra AI Study Assistant', desc: 'Stuck on a question? Ask Astra for a clear, step-by-step explanation any time, day or night.' },
  { icon: 'fa-chart-line', title: 'Progress Analytics', desc: 'See your score trend, timing and weakest topics at a glance, so every session sharpens the next.' },
  { icon: 'fa-book-open', title: 'Full JAMB Syllabus', desc: 'Every topic JAMB can test you on, organized by subject and mapped to the official 2027 syllabus.' },
  { icon: 'fa-database', title: '50,000+ Past Questions', desc: 'A constantly refreshed bank of syllabus-matched questions across all 17 UTME subjects.' },
  { icon: 'fa-wifi', title: 'Works Offline', desc: 'Install CBT Pro as an app and keep practicing on the go, even with little or no data.' },
]

export const STEPS = [
  { icon: 'fa-user-plus', title: 'Create your free account', desc: 'Sign up in seconds. No card required to start practicing.' },
  { icon: 'fa-pen-to-square', title: 'Practice or simulate the full exam', desc: 'Drill a single subject, or run a full timed CBT simulation.' },
  { icon: 'fa-trophy', title: 'Track your growth, hit your target', desc: 'Review your analytics after every session and close your gaps before exam day.' },
]


/* Built from your real subject data. Slugs feed /jamb-past-questions/:slug. */
export const SUBJECTS = SUBJECTS_DATA
  .filter((s) => s.id !== 'LEKKI001')
  .map((s) => ({
    name: s.name,
    total: s.totalQuestions,
    slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  }))

export const UTME_FACTS = [
  { num: '400', label: 'maximum UTME score' },
  { num: '4', label: 'subjects, including English' },
  { num: '180', label: 'questions in total' },
  { num: '2 hrs', label: 'to finish the paper' },
]

export const TIPS = [
  { icon: 'fa-stopwatch', title: 'Practice against the clock', desc: 'Use timed sessions early. Pace is a skill, and 180 questions in 2 hours leaves little room to dwell.' },
  { icon: 'fa-bullseye', title: 'Fix weak topics first', desc: 'Check your analytics after each session and spend your next one on the topics where you lost marks.' },
  { icon: 'fa-clock-rotate-left', title: 'Study past questions by year', desc: 'JAMB repeats patterns. Working through past papers shows you how topics are asked.' },
  { icon: 'fa-lightbulb', title: 'Read every explanation', desc: 'Do not stop at right or wrong. Understanding why an answer holds is what transfers to new questions.' },
  { icon: 'fa-laptop', title: 'Get used to the computer', desc: 'Navigating, flagging and submitting on screen should feel automatic before exam day.' },
]

export const REVIEWS = [
  {
    name: "Chinedu Okafor",
    meta: "UTME candidate, Lagos",
    rating: 5,
    text: "The simulator feels just like the actual JAMB examination. Practising here made me more comfortable with the CBT interface."
  },
  {
    name: "Aisha Bello",
    meta: "UTME candidate, Kano",
    rating: 3,
    text: "I really like the AI explanations. Physics used to give me problems, but now I understand some topics much better."
  },
  {
    name: "Tunde Adeyemi",
    meta: "UTME candidate, Ibadan",
    rating: 4,
    text: "The past questions are helpful, especially when revising by year. I just wish there were more questions in some subjects."
  },
  {
    name: "Ngozi Eze",
    meta: "UTME candidate, Awka",
    rating: 5,
    text: "I mostly use it when travelling. The offline feature is really convenient because I don't always have data."
  },
  {
    name: "David Emmanuel",
    meta: "UTME candidate, Port Harcourt",
    rating: 3,
    text: "Pretty good platform. I like the timer and how the questions are arranged. Still getting used to some of the features though."
  },
  {
    name: "Fatima Yusuf",
    meta: "UTME candidate, Ilorin",
    rating: 5,
    text: "The explanations are my favourite part. I don't just see the correct answer; I actually understand why it is correct."
  },
  {
    name: "Hauwa Ibrahim",
    meta: "UTME candidate, Jos",
    rating: 5,
    text: "I love that I can plan my own exams and set a target score. It gives me something to work towards and helps me take my preparation more seriously."
  },
  {
    name: "Esther Johnson",
    meta: "UTME candidate, Calabar",
    rating: 4,
    text: "I use it mostly for evening practice. It helps me keep track of what I have studied, although I am still exploring some of its features."
  }
];

export const FAQS = [
  { q: 'How accurate is this compared to real JAMB?', a: '98% match. We reverse-engineered the 2026 JAMB CBT software. Timer, layout, and scoring work identically. The only difference is our questions have explanations.' },
  { q: 'Do I need to create an account before using the platform?', a: 'No. You can browse JAMB past questions as a guest. A free account unlocks the full CBT simulator, syllabus materials and progress tracking, and saves your performance so you can pick up where you left off.' },
  { q: 'Are the questions based on the official JAMB syllabus?', a: 'Yes. Every question is structured to follow the official JAMB syllabus and exam pattern, so you are always practicing exactly what is required.' },
  { q: 'How is the JAMB UTME scored?', a: 'You write four subjects, each scored out of 100, for a total of 400. Use of English has 60 questions and each other subject has 40, making 180 questions in 2 hours.' },
  { q: 'Can I improve my score using this platform alone?', a: 'Consistent use gives you real CBT practice, syllabus-based questions, and performance feedback. Best results come from pairing it with regular review of your textbooks and notes.' },
  { q: 'Do I need to pay to access full questions or subjects?', a: `Full access requires a ₦${ACTIVATION_PRICE} yearly subscription, covering unlimited practice across every question, subject, and CBT feature for a full year.` },
  { q: 'Does CBT Pro include an AI-powered tutor for explanations?', a: 'Yes. The built-in Astra AI Tutor helps you understand concepts, not just memorize answers, so you can walk into the exam confident.' },
  { q: 'Can I use it on Android devices?', a: 'Yes. CBT Pro works smoothly on Android, iPhone, tablets, and desktop, so you can practice anytime, anywhere.' },
]
