// ── Field-level validation ────────────────────────────────────────────────────

export const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
// Combined value is always "+XX localNumber" from the PhoneInput component
export const PHONE_RE = /^\+\d{1,4}\s[0-9\s\-().]{4,18}$/

/**
 * Normalise a phone string before storing / submitting.
 * Trims the whole value, then collapses multiple spaces in the local part
 * so "+47  32 344   322" becomes "+47 32 344 322".
 */
export function normalizePhone(phone) {
  if (!phone) return ''
  const trimmed = phone.trim()
  const spaceIdx = trimmed.indexOf(' ')
  if (spaceIdx === -1) return trimmed          // no local part yet
  const code  = trimmed.slice(0, spaceIdx)
  const local = trimmed.slice(spaceIdx + 1).replace(/\s+/g, ' ').trim()
  return local ? `${code} ${local}` : code
}

/**
 * Validate Step 2 (Personal Information) values.
 * Returns a map of fieldName → error message string.
 * An empty object means all fields are valid.
 *
 * @param {object} values  - Current form values
 * @param {object} t       - Translation object (from useLanguage)
 * @returns {object}       - Error map { fieldName: message }
 */
export function validateStep2(values, t) {
  const errs = {}

  if (!values.firstName.trim())           errs.firstName = t.firstNameRequired
  else if (values.firstName.length > 100) errs.firstName = t.firstNameTooLong

  if (!values.lastName.trim())            errs.lastName  = t.lastNameRequired
  else if (values.lastName.length > 100)  errs.lastName  = t.lastNameTooLong

  if (!EMAIL_RE.test(values.email))       errs.email     = t.emailInvalid

  if (!PHONE_RE.test(values.phone))       errs.phone     = t.phoneInvalid

  if (!values.birthDate) {
    errs.birthDate = t.birthDateRequired
  } else {
    const bd = new Date(values.birthDate)
    // Get today as a YYYY-MM-DD string in local time to avoid UTC midnight
    // mismatch (new Date('2026-05-31') is midnight UTC, not midnight local).
    const d = new Date()
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (isNaN(bd))                          errs.birthDate = t.birthDateInvalid
    else if (values.birthDate >= todayStr)  errs.birthDate = t.birthDateFuture
    else if (bd < new Date('1900-01-01'))   errs.birthDate = t.birthDateTooOld
  }

  return errs
}
