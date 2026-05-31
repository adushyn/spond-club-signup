import { useState, useCallback, useRef } from 'react'

// ── Country list — ordered by rough global/European frequency ────────────────

export const COUNTRIES = [
  { iso: 'NO', flag: '🇳🇴', name: 'Norway',         code: '+47'  },
  { iso: 'SE', flag: '🇸🇪', name: 'Sweden',         code: '+46'  },
  { iso: 'DK', flag: '🇩🇰', name: 'Denmark',        code: '+45'  },
  { iso: 'FI', flag: '🇫🇮', name: 'Finland',        code: '+358' },
  { iso: 'GB', flag: '🇬🇧', name: 'United Kingdom', code: '+44'  },
  { iso: 'IE', flag: '🇮🇪', name: 'Ireland',        code: '+353' },
  { iso: 'DE', flag: '🇩🇪', name: 'Germany',        code: '+49'  },
  { iso: 'FR', flag: '🇫🇷', name: 'France',         code: '+33'  },
  { iso: 'NL', flag: '🇳🇱', name: 'Netherlands',    code: '+31'  },
  { iso: 'BE', flag: '🇧🇪', name: 'Belgium',        code: '+32'  },
  { iso: 'CH', flag: '🇨🇭', name: 'Switzerland',    code: '+41'  },
  { iso: 'AT', flag: '🇦🇹', name: 'Austria',        code: '+43'  },
  { iso: 'ES', flag: '🇪🇸', name: 'Spain',          code: '+34'  },
  { iso: 'IT', flag: '🇮🇹', name: 'Italy',          code: '+39'  },
  { iso: 'PT', flag: '🇵🇹', name: 'Portugal',       code: '+351' },
  { iso: 'PL', flag: '🇵🇱', name: 'Poland',         code: '+48'  },
  { iso: 'CZ', flag: '🇨🇿', name: 'Czechia',        code: '+420' },
  { iso: 'SK', flag: '🇸🇰', name: 'Slovakia',       code: '+421' },
  { iso: 'HU', flag: '🇭🇺', name: 'Hungary',        code: '+36'  },
  { iso: 'RO', flag: '🇷🇴', name: 'Romania',        code: '+40'  },
  { iso: 'HR', flag: '🇭🇷', name: 'Croatia',        code: '+385' },
  { iso: 'RS', flag: '🇷🇸', name: 'Serbia',         code: '+381' },
  { iso: 'UA', flag: '🇺🇦', name: 'Ukraine',        code: '+380' },
  { iso: 'LT', flag: '🇱🇹', name: 'Lithuania',      code: '+370' },
  { iso: 'LV', flag: '🇱🇻', name: 'Latvia',         code: '+371' },
  { iso: 'EE', flag: '🇪🇪', name: 'Estonia',        code: '+372' },
  { iso: 'IS', flag: '🇮🇸', name: 'Iceland',        code: '+354' },
  { iso: 'US', flag: '🇺🇸', name: 'United States',  code: '+1'   },
  { iso: 'CA', flag: '🇨🇦', name: 'Canada',         code: '+1'   },
  { iso: 'AU', flag: '🇦🇺', name: 'Australia',      code: '+61'  },
  { iso: 'NZ', flag: '🇳🇿', name: 'New Zealand',    code: '+64'  },
  { iso: 'IN', flag: '🇮🇳', name: 'India',          code: '+91'  },
  { iso: 'PK', flag: '🇵🇰', name: 'Pakistan',       code: '+92'  },
  { iso: 'BD', flag: '🇧🇩', name: 'Bangladesh',     code: '+880' },
  { iso: 'TR', flag: '🇹🇷', name: 'Turkey',         code: '+90'  },
  { iso: 'SA', flag: '🇸🇦', name: 'Saudi Arabia',   code: '+966' },
  { iso: 'AE', flag: '🇦🇪', name: 'UAE',            code: '+971' },
  { iso: 'ZA', flag: '🇿🇦', name: 'South Africa',   code: '+27'  },
  { iso: 'NG', flag: '🇳🇬', name: 'Nigeria',        code: '+234' },
  { iso: 'BR', flag: '🇧🇷', name: 'Brazil',         code: '+55'  },
  { iso: 'MX', flag: '🇲🇽', name: 'Mexico',         code: '+52'  },
  { iso: 'AR', flag: '🇦🇷', name: 'Argentina',      code: '+54'  },
  { iso: 'CN', flag: '🇨🇳', name: 'China',          code: '+86'  },
  { iso: 'JP', flag: '🇯🇵', name: 'Japan',          code: '+81'  },
  { iso: 'KR', flag: '🇰🇷', name: 'South Korea',    code: '+82'  },
  { iso: 'PH', flag: '🇵🇭', name: 'Philippines',    code: '+63'  },
  { iso: 'RU', flag: '🇷🇺', name: 'Russia',         code: '+7'   },
]

// ── Parse an existing combined phone value ────────────────────────────────────

function parsePhone(value) {
  if (!value) return { code: '+47', local: '' }

  // Sort by code length descending so '+358' matches before '+35'
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length)
  for (const c of sorted) {
    if (value.startsWith(c.code)) {
      return { code: c.code, local: value.slice(c.code.length).trim() }
    }
  }
  // Fallback: leave code at default, treat whole thing as local
  return { code: '+47', local: value }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PhoneInput({ label, value, error, onChange, onBlur, t }) {
  const parsed                      = parsePhone(value)
  const [code, setCode]             = useState(parsed.code)
  const [local, setLocal]           = useState(parsed.local)
  const [open, setOpen]             = useState(false)
  const [search, setSearch]         = useState('')
  const wrapRef                     = useRef(null)

  const emit = useCallback((newCode, newLocal) => {
    const combined = newLocal.trim() ? `${newCode} ${newLocal.trim()}` : ''
    onChange({ target: { name: 'phone', value: combined } })
  }, [onChange])

  const handleCodeSelect = useCallback((c) => {
    setCode(c.code)
    setOpen(false)
    setSearch('')
    emit(c.code, local)
  }, [local, emit])

  const handleLocalChange = useCallback((e) => {
    const v = e.target.value
    setLocal(v)
    emit(code, v)
  }, [code, emit])

  // Close dropdown when focus moves outside the whole widget
  const handleBlur = useCallback((e) => {
    if (wrapRef.current && !wrapRef.current.contains(e.relatedTarget)) {
      setOpen(false)
      setSearch('')
      onBlur && onBlur(e)
    }
  }, [onBlur])

  const selectedCountry = COUNTRIES.find(c => c.code === code && c.iso === parsed.iso)
                       || COUNTRIES.find(c => c.code === code)
                       || COUNTRIES[0]

  const filtered = search.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search))
    : COUNTRIES

  return (
    <div className="field" ref={wrapRef} onBlur={handleBlur}>
      <label>{label}</label>
      <div className={`phone-wrap${error ? ' error' : ''}`}>

        {/* ── Country code button ── */}
        <button
          type="button"
          className="phone-code-btn"
          onClick={() => { setOpen(o => !o); setSearch('') }}
          aria-haspopup="listbox"
          aria-expanded={open}
          tabIndex={0}
        >
          <span className="phone-code-flag">{selectedCountry.flag}</span>
          <span className="phone-code-text">{selectedCountry.code}</span>
          <span className="phone-code-chevron">{open ? '▲' : '▼'}</span>
        </button>

        {/* ── Local number input ── */}
        <input
          className="phone-local"
          type="tel"
          name="phone"
          value={local}
          onChange={handleLocalChange}
          placeholder="123 45 678"
          autoComplete="tel-national"
          aria-label={label}
          aria-describedby={error ? 'phone-err' : undefined}
          aria-invalid={!!error}
        />
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div className="phone-dropdown" role="listbox">
          <div className="phone-search-wrap">
            <input
              className="phone-search"
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="phone-list">
            {filtered.length === 0 && (
              <li className="phone-list-empty">No results</li>
            )}
            {filtered.map(c => (
              <li
                key={c.iso}
                role="option"
                aria-selected={c.code === code && c.iso === selectedCountry.iso}
                className={`phone-list-item${c.code === code && c.iso === selectedCountry.iso ? ' active' : ''}`}
                onMouseDown={() => handleCodeSelect(c)}
              >
                <span className="phone-list-flag">{c.flag}</span>
                <span className="phone-list-name">{c.name}</span>
                <span className="phone-list-code">{c.code}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!error && t?.phoneHint && (
        <div className="field-hint">{t.phoneHint}</div>
      )}
      {error && <div id="phone-err" className="field-error" role="alert">⚠ {error}</div>}
    </div>
  )
}
