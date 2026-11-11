import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { Invalid } from '@/components/feedback/Invalid'
import { FilterPage } from './components/FilterPage'
import { getFilteredPage } from './utils/filterPage'

/* Route: /jamb-past-questions/:slug/questions  (optional ?topics=...&years=...)
   Used when the form selection is more than one topic and more than one year. */
export default function FilteredPastQuestions() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const topics = searchParams.get('topics')
  const years = searchParams.get('years')
  const page = useMemo(() => getFilteredPage(slug, { topics, years }), [slug, topics, years])

  if (!page) return <Invalid />
  return <FilterPage key={`${slug}?${topics ?? ''}&${years ?? ''}`} page={page} />
}
