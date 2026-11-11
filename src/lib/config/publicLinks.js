/* Single source of truth for public navigation.
   Used by PublicNav, the mobile drawer and (recommended) the Footer,
   so every public page links to every other one for crawlers. */
export const PUBLIC_NAV_LINKS = [
  { icon: 'fa-book-open', label: 'JAMB Past Questions', to: '/jamb-past-questions' },
  { icon: 'fa-circle-info', label: 'About', to: '/about' },
  { icon: 'fa-life-ring', label: 'Help Center', to: '/help' },
]

export const GUEST_PATH = '/jamb-past-questions'
