import { Link } from 'react-router-dom'
import LanguageSelector from './LanguageSelector.jsx'

export default function Header({ lang, onLangSelect }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="header-logo-link">
          <img
            src="https://www.spond.com/app/themes/sozo/public/images/svg_icons/logo.svg"
            alt="Spond"
            className="header-logo"
            width="145"
            height="40"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <span className="header-logo-text" style={{ display: 'none' }}>Spond</span>
        </Link>

        <div className="header-right">
          <LanguageSelector lang={lang} onSelect={onLangSelect} />
        </div>
      </div>
    </header>
  )
}
