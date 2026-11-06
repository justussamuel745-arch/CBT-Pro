import { SUBJECTS_DATA } from '@/lib/data/subjects'
import { SUBJECT_LIST, subjectSlug } from '@/lib/data/pastQuestionsContent'
import { GUEST_PATH } from '@/lib/config/publicLinks'
import { ACTIVATION_PRICE } from '@lib/config/app.js'
import { SUBJECT_CONTENT, buildFallbackContent } from '../data/subjectContent'

/* ---------- Clean URLs (single place to change them later) ---------- */

export const subjectPath = (slug) => `${GUEST_PATH}/${slug}`
export const subjectTopicPath = (slug, topicSlug) => `${subjectPath(slug)}/topics/${topicSlug}`
export const subjectYearPath = (slug, year) => `${subjectPath(slug)}/years/${year}`

/* ---------- Topic grouping ---------- */

const TOPIC_SEPARATOR = ' - '

// "Number Bases - Modulo arithmetic" -> group "Number Bases", label "Modulo arithmetic".
// Topics without a separator (e.g. Physics) go into a group with a null title.
export function groupTopics(topics) {
  const groups = []
  const byTitle = new Map()

  for (const value of topics) {
    const i = value.indexOf(TOPIC_SEPARATOR)
    const title = i === -1 ? null : value.slice(0, i)
    const label = i === -1 ? value : value.slice(i + TOPIC_SEPARATOR.length)

    let group = byTitle.get(title)
    if (!group) {
      group = { title, topics: [] }
      byTitle.set(title, group)
      groups.push(group)
    }
    group.topics.push({ value, label, slug: subjectSlug(value) })
  }
  return groups
}

/* ---------- Generated copy (always matches your real data) ---------- */

function buildFaqs({ name, slug, total, topicCount, firstYear, lastYear }) {
  const isEnglish = slug === 'english'
  return [
    {
      q: `How many ${name} questions are in the JAMB UTME?`,
      a: isEnglish
        ? 'Use of English has 60 questions. Each of the other three subjects has 40, making 180 questions in 2 hours.'
        : `${name} has 40 questions in the UTME. Use of English has 60 and you write four subjects in total, making 180 questions in 2 hours.`,
    },
    {
      q: `Does CBT Pro have ${name} past questions with answers?`,
      a: `Yes. CBT Pro has ${total.toLocaleString()} ${name} questions from ${firstYear} to ${lastYear}, and questions come with answers and explanations.`,
    },
    {
      q: `Can I practice ${name} by topic or by year?`,
      a: `Yes. This page links to all ${topicCount} ${name} topics and to every year from ${firstYear} to ${lastYear}, and the setup form above lets you combine them.`,
    },
    {
      q: `Is ${name} compulsory in JAMB?`,
      a: isEnglish
        ? 'Yes. Use of English is compulsory for every UTME candidate.'
        : 'No. Use of English is compulsory, but the other three subjects depend on your course. Check the admission requirements of your chosen course.',
    },
    {
      q: `Can I practice ${name} past questions for free?`,
      a: `You can browse as a guest. A free account lets you save your progress, and full access to every question requires the ₦${ACTIVATION_PRICE} yearly subscription.`,
    },
  ]
}

/* ---------- Public API ---------- */

export function getSubjectPage(slug) {
  const item = SUBJECT_LIST.find((s) => s.slug === slug)
  if (!item) return null

  const raw = SUBJECTS_DATA.find((s) => s.id === item.id)
  const topics = raw.topics ?? []
  const years = raw.years ?? []
  const sortedYears = [...years].sort((a, b) => Number(b) - Number(a))
  const firstYear = sortedYears.length ? String(sortedYears[sortedYears.length - 1]) : ''
  const lastYear = sortedYears.length ? String(sortedYears[0]) : ''
  const content = SUBJECT_CONTENT[slug] ?? buildFallbackContent(item.name)

  const subject = {
    ...item,
    rawName: raw.name, // the name the study flow expects (e.g. "English")
    topics,
    years,
    topicOptions: topics.map((t) => ({ value: t, label: t })),
    yearOptions: sortedYears.map((y) => ({ value: y, label: String(y) })),
    topicGroups: groupTopics(topics),
    topicCount: topics.length,
    firstYear,
    lastYear,
  }

  const dataParagraph = `CBT Pro has ${subject.total.toLocaleString()} ${subject.name} past questions${
    firstYear ? ` from ${firstYear} to ${lastYear}` : ''
  }, organized across ${subject.topicCount} topics. Every question comes with an answer and an explanation, so you learn the reasoning as well as the result.`

  return {
    ...subject,
    intro: [...content.intro, dataParagraph],
    tests: content.tests,
    tips: content.tips,
    samples: content.samples,
    faqs: buildFaqs(subject),
  }
}
