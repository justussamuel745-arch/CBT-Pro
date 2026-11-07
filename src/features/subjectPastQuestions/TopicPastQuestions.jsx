import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { Invalid } from '@/components/feedback/Invalid'
import { FilterPage } from './components/FilterPage'
import { getTopicPage } from './utils/filterPage'

/* Route: /jamb-past-questions/:slug/topic/:topicSlug  (optional ?years=2019,2020) */
export default function TopicPastQuestions() {
  const { slug, topicSlug } = useParams()
  const [searchParams] = useSearchParams()
  const years = searchParams.get('years')
  const page = useMemo(() => getTopicPage(slug, topicSlug, { years }), [slug, topicSlug, years])

  if (!page) return <Invalid />
  // key resets the answers and the form when the topic or the years change
  return <FilterPage key={`${slug}/${topicSlug}?${years ?? ''}`} page={page} />
}
