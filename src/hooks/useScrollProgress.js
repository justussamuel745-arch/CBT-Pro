import { useEffect, useState } from 'react'

/* Returns { scrolled, progress } for sticky-nav styling and the
   top scroll-progress bar. Reusable on every public page. */
export function useScrollProgress() {
  const [state, setState] = useState({ scrolled: false, progress: 0 })

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      setState({
        scrolled: doc.scrollTop > 8,
        progress: scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0,
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return state
}
