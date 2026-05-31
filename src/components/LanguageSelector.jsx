import { LANGUAGES } from '../i18n/translations.js'

export default function LanguageSelector({ lang, onSelect }) {
  return (
    <div className="lang-selector">
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          className={`lang-btn${lang === l.code ? ' lang-btn--active' : ''}`}
          onClick={() => onSelect(l.code)}
          aria-label={l.label}
          title={l.label}
        >
          <span className="lang-flag">{l.flag}</span>
          <span className="lang-code">{l.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
