import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { translations, detectLanguage, LANGUAGES } from '../i18n/translations.js'

// ── Static structure ──────────────────────────────────────────────────────────
describe('translations', () => {
  it('has both en and no locales', () => {
    expect(translations).toHaveProperty('en')
    expect(translations).toHaveProperty('no')
  })

  it('en and no have the same keys', () => {
    const enKeys = Object.keys(translations.en).sort()
    const noKeys = Object.keys(translations.no).sort()
    expect(enKeys).toEqual(noKeys)
  })

  it('successTitle is a function that interpolates name', () => {
    expect(translations.en.successTitle('Alona')).toBe('Welcome, Alona!')
    expect(translations.no.successTitle('Alona')).toContain('Alona')
  })

  it('registrationOpensDesc is a function', () => {
    const result = translations.en.registrationOpensDesc('1 Jan 2025')
    expect(result).toContain('1 Jan 2025')
  })
})

describe('LANGUAGES', () => {
  it('contains en and no entries', () => {
    const codes = LANGUAGES.map(l => l.code)
    expect(codes).toContain('en')
    expect(codes).toContain('no')
  })

  it('each entry has code, label and flag', () => {
    LANGUAGES.forEach(lang => {
      expect(lang).toHaveProperty('code')
      expect(lang).toHaveProperty('label')
      expect(lang).toHaveProperty('flag')
    })
  })
})

// ── detectLanguage ────────────────────────────────────────────────────────────
describe('detectLanguage', () => {
  const originalNavigator = global.navigator

  function setLanguage(lang) {
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: { language: lang, languages: [lang] },
    })
  }

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: originalNavigator,
    })
  })

  it('returns "en" for en-US', () => {
    setLanguage('en-US')
    expect(detectLanguage()).toBe('en')
  })

  it('returns "en" for en-GB', () => {
    setLanguage('en-GB')
    expect(detectLanguage()).toBe('en')
  })

  it('returns "no" for nb-NO (Norwegian Bokmål)', () => {
    setLanguage('nb-NO')
    expect(detectLanguage()).toBe('no')
  })

  it('returns "no" for nb', () => {
    setLanguage('nb')
    expect(detectLanguage()).toBe('no')
  })

  it('returns "no" for nn (Norwegian Nynorsk)', () => {
    setLanguage('nn')
    expect(detectLanguage()).toBe('no')
  })

  it('falls back to "en" for unsupported locale', () => {
    setLanguage('fr-FR')
    expect(detectLanguage()).toBe('en')
  })

  it('falls back to "en" for unknown language', () => {
    setLanguage('xyz')
    expect(detectLanguage()).toBe('en')
  })
})
