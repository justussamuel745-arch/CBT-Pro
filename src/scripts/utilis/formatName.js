export function formatName(subject){
  let formattedName = subject
  if (subject === 'English'){
    formattedName = 'Use of English'
  } else if (subject === 'Lekki'){
    formattedName = 'The Lekki Headmaster'
  } else if (subject === 'Computer'){
    formattedName = 'Computer Studies'
  } else if (subject === 'FineArt'){
    formattedName = 'Fine Art'
  } else if (subject === 'HomeEconomics'){
    formattedName = 'Home Economics'
  } else if (subject === 'PhysicalHealth'){
    formattedName = 'physical Health'
  }
  
  return formattedName
}