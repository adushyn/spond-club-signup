import { useState, useCallback } from 'react'
import { translations, detectLanguage } from '../i18n/translations.js'

const LANG_KEY = 'spond_language'

export function useLanguage() {
  const [lang, setLangState] = useState(() => {
    try {
      return sessionStorage.getItem(LANG_KEY) || detectLanguage()
    } catch {
      return detectLanguage()
    }
  })

  const setLang = useCallback((code) => {
    setLangState(code)
    try { sessionStorage.setItem(LANG_KEY, code) } catch { /* ignore */ }
  }, [])

  return { lang, setLang, t: translations[lang] }
}
