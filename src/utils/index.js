export function createPageUrl(name) {
  return `/${name}`
}

// Formatar data de AAAA-MM-DD para DD/MM/AAAA
export function formatDateBR(dateString) {
  if (!dateString) return ''
  try {
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  } catch {
    return dateString
  }
}

// Formatar data de DD/MM/AAAA para AAAA-MM-DD (para inputs type="date")
export function formatDateInput(dateString) {
  if (!dateString) return ''
  try {
    const [day, month, year] = dateString.split('/')
    return `${year}-${month}-${day}`
  } catch {
    return dateString
  }
}

