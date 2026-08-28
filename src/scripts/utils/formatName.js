const displayName = {
  'English': 'Use of English',
  'Lekki': 'The Lekki Headmaster',
  'Computer': 'Computer Studies',
  'FineArt': 'Fine Art',
  'HomeEconomics': 'Home Economics',
  'PhysicalHealth': 'Physical Health',
  'CurrentAffairs': 'Current Affairs',
  'Civic': 'Civic Education'
}

export function formatName(subject){
  return displayName[subject] || subject
}