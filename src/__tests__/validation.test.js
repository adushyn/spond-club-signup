import { describe, it, expect } from 'vitest'
import { validateStep2, EMAIL_RE, PHONE_RE, normalizePhone } from '../validation.js'
import { translations } from '../i18n/translations.js'

// Use English translations as the t object throughout
const t = translations.en

// ── Helper to build a valid base object ──────────────────────────────────────
function valid(overrides = {}) {
  return {
    firstName: 'Jane',
    lastName:  'Doe',
    email:     'jane@example.com',
    phone:     '+44 7911 123456',
    birthDate: '1990-06-15',
    ...overrides,
  }
}

// ── EMAIL_RE ─────────────────────────────────────────────────────────────────
describe('EMAIL_RE', () => {
  const valid_emails = [
    'user@example.com',
    'user.name+tag@sub.domain.org',
    'a@b.io',
    'USER@EXAMPLE.COM',
  ]
  const invalid_emails = [
    '',
    'plainaddress',
    '@missing.local',
    'missing@',
    'missing@domain',
    'two@@domain.com',
  ]

  valid_emails.forEach(e => {
    it(`accepts "${e}"`, () => expect(EMAIL_RE.test(e)).toBe(true))
  })

  invalid_emails.forEach(e => {
    it(`rejects "${e}"`, () => expect(EMAIL_RE.test(e)).toBe(false))
  })
})

// ── PHONE_RE ─────────────────────────────────────────────────────────────────
// PhoneInput always emits "+countryCode localNumber" so the regex requires
// a leading "+" prefix followed by a space before the local number.
describe('PHONE_RE', () => {
  const valid_phones = [
    '+44 7911 123456',
    '+47 123 45 678',
    '+1 5551234567',
    '+46 70-123 45 67',
    '+358 40 123 4567',
  ]
  const invalid_phones = [
    '',
    '4712345678',          // missing + prefix
    '07911123456',         // no country code
    '+4712345678',         // no space between code and local
    'abc',
    '+',
  ]

  valid_phones.forEach(p => {
    it(`accepts "${p}"`, () => expect(PHONE_RE.test(p)).toBe(true))
  })

  invalid_phones.forEach(p => {
    it(`rejects "${p}"`, () => expect(PHONE_RE.test(p)).toBe(false))
  })
})

// ── validateStep2 ─────────────────────────────────────────────────────────────
describe('validateStep2', () => {
  it('returns empty errors for fully valid input', () => {
    expect(validateStep2(valid(), t)).toEqual({})
  })

  // firstName
  it('requires firstName', () => {
    const errs = validateStep2(valid({ firstName: '' }), t)
    expect(errs.firstName).toBe(t.firstNameRequired)
  })

  it('requires non-blank firstName', () => {
    const errs = validateStep2(valid({ firstName: '   ' }), t)
    expect(errs.firstName).toBe(t.firstNameRequired)
  })

  it('rejects firstName longer than 100 chars', () => {
    const errs = validateStep2(valid({ firstName: 'A'.repeat(101) }), t)
    expect(errs.firstName).toBe(t.firstNameTooLong)
  })

  it('accepts firstName exactly 100 chars', () => {
    const errs = validateStep2(valid({ firstName: 'A'.repeat(100) }), t)
    expect(errs.firstName).toBeUndefined()
  })

  // lastName
  it('requires lastName', () => {
    const errs = validateStep2(valid({ lastName: '' }), t)
    expect(errs.lastName).toBe(t.lastNameRequired)
  })

  it('rejects lastName longer than 100 chars', () => {
    const errs = validateStep2(valid({ lastName: 'B'.repeat(101) }), t)
    expect(errs.lastName).toBe(t.lastNameTooLong)
  })

  // email
  it('rejects invalid email', () => {
    const errs = validateStep2(valid({ email: 'not-an-email' }), t)
    expect(errs.email).toBe(t.emailInvalid)
  })

  it('rejects empty email', () => {
    const errs = validateStep2(valid({ email: '' }), t)
    expect(errs.email).toBe(t.emailInvalid)
  })

  it('accepts valid email', () => {
    const errs = validateStep2(valid({ email: 'hello@spond.com' }), t)
    expect(errs.email).toBeUndefined()
  })

  // phone
  it('rejects invalid phone', () => {
    const errs = validateStep2(valid({ phone: 'abc' }), t)
    expect(errs.phone).toBe(t.phoneInvalid)
  })

  it('rejects too-short phone', () => {
    const errs = validateStep2(valid({ phone: '12345' }), t)
    expect(errs.phone).toBe(t.phoneInvalid)
  })

  it('accepts valid phone', () => {
    const errs = validateStep2(valid({ phone: '+47 123 45 678' }), t)
    expect(errs.phone).toBeUndefined()
  })

  // birthDate
  it('requires birthDate', () => {
    const errs = validateStep2(valid({ birthDate: '' }), t)
    expect(errs.birthDate).toBe(t.birthDateRequired)
  })

  it('rejects future birthDate', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const errs = validateStep2(valid({ birthDate: future.toISOString().split('T')[0] }), t)
    expect(errs.birthDate).toBe(t.birthDateFuture)
  })

  it('rejects birthDate set to tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const errs = validateStep2(valid({ birthDate: tomorrow.toISOString().split('T')[0] }), t)
    expect(errs.birthDate).toBe(t.birthDateFuture)
  })

  it('rejects birthDate set to today (timezone-safe)', () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const errs = validateStep2(valid({ birthDate: todayStr }), t)
    expect(errs.birthDate).toBe(t.birthDateFuture)
  })


  it('rejects birthDate before 1900', () => {
    const errs = validateStep2(valid({ birthDate: '1899-12-31' }), t)
    expect(errs.birthDate).toBe(t.birthDateTooOld)
  })

  it('accepts valid past birthDate', () => {
    const errs = validateStep2(valid({ birthDate: '1985-03-20' }), t)
    expect(errs.birthDate).toBeUndefined()
  })

  // multiple errors
  it('returns multiple errors at once', () => {
    const errs = validateStep2(valid({ firstName: '', email: 'bad' }), t)
    expect(errs.firstName).toBeDefined()
    expect(errs.email).toBeDefined()
    expect(errs.lastName).toBeUndefined()
  })

  // Norwegian translations
  it('uses Norwegian error messages when t=no', () => {
    const no = translations.no
    const errs = validateStep2(valid({ firstName: '' }), no)
    expect(errs.firstName).toBe(no.firstNameRequired)
    expect(errs.firstName).not.toBe(t.firstNameRequired)
  })
})

// ── normalizePhone ────────────────────────────────────────────────────────────

describe('normalizePhone', () => {
  it('collapses multiple spaces in local part', () => {
    expect(normalizePhone('+47  32344   322 323')).toBe('+47 32344 322 323')
  })

  it('trims leading and trailing whitespace', () => {
    expect(normalizePhone('  +47 123 45 678  ')).toBe('+47 123 45 678')
  })

  it('leaves a clean number unchanged', () => {
    expect(normalizePhone('+44 7911 123456')).toBe('+44 7911 123456')
  })

  it('handles empty string', () => {
    expect(normalizePhone('')).toBe('')
  })

  it('handles code-only (no local part yet)', () => {
    expect(normalizePhone('+47')).toBe('+47')
  })
})
