import { subjectPath, subjectTopicPath, subjectYearPath } from './subjectPage'

/* Everything about turning a topics / years / page-size selection into a URL and back. */

export const PAGE_SIZES = [10, 20, 30, 50]
export const DEFAULT_PAGE_SIZE = 10

export const readPageSize = (searchParams) => {
  const size = Number(searchParams.get('size'))
  return PAGE_SIZES.includes(size) ? size : DEFAULT_PAGE_SIZE
}

export const readPage = (searchParams, totalPages) => {
  const page = Number.parseInt(searchParams.get('page'), 10)
  if (!Number.isInteger(page) || page < 1) return 1
  return Math.min(page, totalPages)
}

const toList = (csv) => (csv ? csv.split(',').map((s) => s.trim()).filter(Boolean) : null)

// ?years=2019,2020 -> matching raw year values. No param = all years. Nothing valid = null.
export function resolveYears(subject, csv) {
  const list = toList(csv)
  if (!list) return subject.years
  const wanted = new Set(list)
  const matched = subject.years.filter((y) => wanted.has(String(y)))
  return matched.length ? matched : null
}

// ?topics=slug-a,slug-b -> matching raw topic values. No param = all topics. Nothing valid = null.
export function resolveTopics(subject, csv) {
  const list = toList(csv)
  if (!list) return subject.topics
  const wanted = new Set(list)
  const matched = subject.topicGroups
    .flatMap((g) => g.topics)
    .filter((t) => wanted.has(t.slug))
    .map((t) => t.value)
  return matched.length ? matched : null
}

// Short text such as "All topics · 2019" shown above the questions
export function describeSelection(subject, topics, years) {
  const t =
    topics.length === subject.topics.length ? 'All topics'
      : topics.length === 1 ? topics[0]
        : `${topics.length} topics`
  const y =
    years.length === subject.years.length ? 'All years'
      : years.length <= 4 ? years.map(String).join(', ')
        : `${years.length} years`
  return `${t} · ${y}`
}

/* The URL a form selection leads to:
   one topic  -> /topic/:topicSlug  (+ ?years= when only some years are chosen)
   one year   -> /year/:year        (+ ?topics= when only some topics are chosen)
   otherwise  -> /questions         (+ ?topics= and ?years= for whatever is not "all") */
export function buildQuestionsPath(subject, topics, years, size) {
  const slugByValue = new Map(
    subject.topicGroups.flatMap((g) => g.topics).map((t) => [t.value, t.slug]),
  )
  const topicSlugs = topics.map((t) => slugByValue.get(t)).filter(Boolean)
  const yearValues = years.map(String)
  const allTopics = topics.length === subject.topics.length
  const allYears = years.length === subject.years.length
  const params = new URLSearchParams()
  let base

  if (topicSlugs.length === 1) {
    base = subjectTopicPath(subject.slug, topicSlugs[0])
    if (!allYears) params.set('years', yearValues.join(','))
  } else if (yearValues.length === 1) {
    base = subjectYearPath(subject.slug, yearValues[0])
    if (!allTopics) params.set('topics', topicSlugs.join(','))
  } else {
    base = `${subjectPath(subject.slug)}/questions`
    if (!allTopics) params.set('topics', topicSlugs.join(','))
    if (!allYears) params.set('years', yearValues.join(','))
  }

  if (size !== DEFAULT_PAGE_SIZE) params.set('size', String(size))

  const qs = params.toString().replace(/%2C/g, ',')
  return qs ? `${base}?${qs}` : base
}
