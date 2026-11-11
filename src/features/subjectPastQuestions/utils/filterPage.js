import {
  buildFreeAccessFaq, getSubjectPage, getTopicLinks, getYearLinks,
  subjectPath, subjectTopicPath, subjectYearPath,
} from './subjectPage'
import { resolveTopics, resolveYears } from './questionFilters'

/* Builds everything the shared FilterPage needs for one subject's topic, year or free selection.
   `query` holds the optional ?topics= / ?years= values from the URL.
   Every function returns null when the subject, topic, year or selection does not exist. */

const RELATED_LIMIT = 12
const questionsInPaper = (slug) => (slug === 'english' ? 60 : 40)

const HOW_TO_USE_FAQ = {
  q: 'How do I use the questions on this page?',
  a: 'Choose an option to see whether it is right. The correct answer is shown with its explanation, and your choice is locked once you answer. If you would rather see the explanation first, use the Show explanation button.',
}

const GENERAL_TIPS = [
  { title: 'Answer before you look', desc: 'Pick an option first, then read the explanation. You learn more from a wrong answer you committed to.' },
  { title: 'Read every explanation', desc: 'Understanding why an answer is right helps you with questions you have not seen before.' },
  { title: 'Come back to the ones you missed', desc: 'Note the topics you got wrong and practice them again a few days later.' },
]

export function getTopicPage(slug, topicSlug, query = {}) {
  const subject = getSubjectPage(slug)
  if (!subject) return null

  const group = subject.topicGroups.find((g) => g.topics.some((t) => t.slug === topicSlug))
  if (!group) return null
  const topic = group.topics.find((t) => t.slug === topicSlug)

  const years = resolveYears(subject, query.years)
  if (!years) return null

  const { name, topicCount, firstYear, lastYear } = subject
  const displayName = group.title ? `${group.title} (${topic.label})` : topic.label

  // Other topics from the same group; for a long flat list, a window around this topic
  const others = group.topics.filter((t) => t.slug !== topicSlug)
  let related = others
  if (!group.title && others.length > RELATED_LIMIT) {
    const index = group.topics.findIndex((t) => t.slug === topicSlug)
    const start = Math.max(0, Math.min(index - RELATED_LIMIT / 2, others.length - RELATED_LIMIT))
    related = others.slice(start, start + RELATED_LIMIT)
  }

  return {
    subject,
    canonicalPath: subjectTopicPath(slug, topicSlug),
    noindex: Boolean(query.years),
    heading: `${name} ${displayName}`,
    breadcrumbLabel: displayName,
    topics: [topic.value],
    years,
    seo: {
      title: `${name} ${displayName} JAMB Past Questions | CBT Pro`,
      description: `Read and answer ${name} JAMB past questions on ${displayName}, each with the correct answer and an explanation, on CBT Pro.`,
    },
    lead: `Work through ${name} JAMB past questions on ${displayName}. Choose an answer to check it, or open the explanation first.`,
    about: [
      `${displayName} is one of the ${topicCount} topics in the JAMB ${name} syllabus${group.title ? `, under ${group.title}` : ''}. Practicing it on its own shows you how well you know this part before you move on to mixed questions.`,
      'Past questions on a single topic show you the styles of question that are asked. Every question on this page comes with an answer and an explanation.',
    ],
    tips: [
      { title: 'Practice this topic first', desc: 'Work through a few pages on just this topic until your answers are steady.' },
      ...GENERAL_TIPS.slice(0, 1),
      { title: 'Mix in other topics', desc: 'Once you are comfortable, add related topics or other years so you practice switching between topics, as the real exam does.' },
    ],
    related: [
      { title: `More ${name} topics`, links: getTopicLinks(subject, related) },
      { title: `${name} past questions by year`, links: getYearLinks(subject) },
    ].filter((block) => block.links.length > 0),
    moreLink: { to: subjectPath(slug), label: `All ${name} past questions` },
    faqs: [
      {
        q: `Are there ${name} past questions on ${displayName}?`,
        a: `Yes. ${displayName} is one of the ${topicCount} ${name} topics on CBT Pro. The questions are listed on this page, each with an answer and an explanation.`,
      },
      HOW_TO_USE_FAQ,
      {
        q: `Which years are covered for ${name}?`,
        a: `${name} questions on CBT Pro run from ${firstYear} to ${lastYear}.`,
      },
      buildFreeAccessFaq(name),
    ],
  }
}

export function getYearPage(slug, yearParam, query = {}) {
  const subject = getSubjectPage(slug)
  if (!subject) return null

  const year = subject.years.find((y) => String(y) === String(yearParam))
  if (year === undefined) return null

  const topics = resolveTopics(subject, query.topics)
  if (!topics) return null

  const label = String(year)
  const { name, topicCount, firstYear, lastYear } = subject
  const paperSize = questionsInPaper(slug)

  return {
    subject,
    canonicalPath: subjectYearPath(slug, label),
    noindex: Boolean(query.topics),
    heading: `${name} ${label}`,
    breadcrumbLabel: label,
    topics,
    years: [year],
    seo: {
      title: `${name} ${label} JAMB Past Questions and Answers | CBT Pro`,
      description: `Read and answer ${name} ${label} JAMB past questions, each with the correct answer and an explanation, on CBT Pro.`,
    },
    lead: `Work through ${name} questions from ${label} in the JAMB UTME style. Choose an answer to check it, or open the explanation first.`,
    about: [
      `This page is for ${name} questions from the ${label} JAMB exam. Practicing a full year shows you how questions are spread across the syllabus and how quickly you need to answer.`,
      `A real UTME ${name} paper has ${paperSize} questions, and your four subjects share 2 hours. Practice a year with a timer to get used to that pace.`,
    ],
    tips: [
      { title: 'Time yourself', desc: 'Set a timer for your session so you get used to the pace of the real exam.' },
      GENERAL_TIPS[1],
      { title: 'Compare years', desc: 'Practice two or three years in a row and note which topics you keep missing. Those are the ones to revise.' },
    ],
    related: [
      { title: `Other ${name} years`, links: getYearLinks(subject, label) },
    ].filter((block) => block.links.length > 0),
    moreLink: { to: subjectPath(slug), label: `Browse all ${topicCount} ${name} topics` },
    faqs: [
      {
        q: `Does CBT Pro have ${name} ${label} past questions?`,
        a: `Yes. ${label} is one of the ${subject.years.length} years available for ${name}, from ${firstYear} to ${lastYear}, and questions come with answers and explanations.`,
      },
      {
        q: `How many questions are in the real UTME ${name} paper?`,
        a: `${name} has ${paperSize} questions in the UTME. Use of English has 60 and each other subject has 40, making 180 questions in 2 hours.`,
      },
      HOW_TO_USE_FAQ,
      buildFreeAccessFaq(name),
    ],
  }
}

// /jamb-past-questions/:slug/questions with any ?topics= and ?years= (what the form sends for mixed selections)
export function getFilteredPage(slug, query = {}) {
  const subject = getSubjectPage(slug)
  if (!subject) return null

  const topics = resolveTopics(subject, query.topics)
  const years = resolveYears(subject, query.years)
  if (!topics || !years) return null

  const { name, topicCount } = subject

  return {
    subject,
    canonicalPath: `${subjectPath(slug)}/questions`,
    noindex: true,
    heading: name,
    breadcrumbLabel: 'Selected questions',
    topics,
    years,
    seo: {
      title: `${name} JAMB Past Questions | CBT Pro`,
      description: `Read and answer ${name} JAMB past questions for the topics and years you chose, each with an answer and an explanation, on CBT Pro.`,
    },
    lead: `These ${name} questions match the topics and years you chose. Choose an answer to check it, or open the explanation first.`,
    about: [
      `This page lists ${name} past questions for the topics and years you selected. You can change the selection at any time with the filter above the questions.`,
      `CBT Pro covers ${topicCount} ${name} topics. Every question comes with an answer and an explanation.`,
    ],
    tips: GENERAL_TIPS,
    related: [{ title: `${name} past questions by year`, links: getYearLinks(subject) }],
    moreLink: { to: subjectPath(slug), label: `All ${name} past questions` },
    faqs: [HOW_TO_USE_FAQ, buildFreeAccessFaq(name)],
  }
}
