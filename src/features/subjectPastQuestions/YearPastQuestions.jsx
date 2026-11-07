import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { Invalid } from '@/components/feedback/Invalid'
import { FilterPage } from './components/FilterPage'
import { getYearPage } from './utils/filterPage'

/* Route: /jamb-past-questions/:slug/year/:year  (optional ?topics=slug-a,slug-b) */
export default function YearPastQuestions() {
  const { slug, year } = useParams()
  const [searchParams] = useSearchParams()
  const topics = searchParams.get('topics')
  const page = useMemo(() => getYearPage(slug, year, { topics }), [slug, year, topics])

  if (!page) return <Invalid />
  // key resets the answers and the form when the year or the topics change
  return <FilterPage key={`${slug}/${year}?${topics ?? ''}`} page={page} />
}
