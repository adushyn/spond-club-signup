import { useState, useEffect, useCallback } from 'react'
import { Routes, Route }  from 'react-router-dom'
import Header             from './components/Header.jsx'
import Footer             from './components/Footer.jsx'
import Snackbar           from './components/Snackbar.jsx'
import SignupPage         from './pages/SignupPage.jsx'
import ManagePage         from './pages/ManagePage.jsx'
import NotFoundPage       from './pages/NotFoundPage.jsx'
import HealthPage         from './pages/HealthPage.jsx'
import { useLanguage }    from './hooks/useLanguage.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export default function App() {
  const { lang, setLang, t } = useLanguage()
  const [form, setForm]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [snackbar, setSnackbar] = useState(null) // { msg, type }

  const showSnackbar = useCallback((msg, type = 'success') => setSnackbar({ msg, type }), [])
  const hideSnackbar = useCallback(() => setSnackbar(null), [])

  // Fetch with automatic retry + exponential back-off.
  // Handles Render free-tier cold-starts (first request may take 30–50 s).
  const fetchForm = useCallback(() => {
    setLoading(true)
    setLoadError(null)

    const MAX_RETRIES = 3
    const DELAYS      = [1500, 3000, 6000] // ms between attempts

    const attempt = (n) =>
      fetch(`${API_BASE}/api/form`)
        .then(r => {
          if (!r.ok) {
            const err = new Error(`http_${r.status}`)
            // 4xx errors are client-side problems — retrying won't help
            err.retryable = r.status >= 500
            throw err
          }
          return r.json()
        })
        .then(data => { setForm(data); setLoading(false) })
        .catch(err => {
          // Network / transport errors (connection refused, CORS, etc.) have no
          // retryable flag set, so they default to retryable=true
          const retryable = err.retryable !== false
          if (retryable && n < MAX_RETRIES) {
            setTimeout(() => attempt(n + 1), DELAYS[n - 1])
          } else {
            setLoadError(err.message)
            setLoading(false)
          }
        })

    attempt(1)
  }, [])

  useEffect(() => { fetchForm() }, [fetchForm])

  return (
    <div className="page">
      <Header lang={lang} onLangSelect={setLang} />

      <div className="page-body">
        {/* Spond gradient decoration */}
        <div className="page-gradient-wrap">
          <img
            src="https://www.spond.com/app/themes/sozo/public/images/bg-top-gradient.svg"
            alt=""
            aria-hidden="true"
            className="page-gradient-img"
            width="1440"
            height="234"
          />
        </div>

        <main className="card" role="main">
          <Routes>
            <Route
              path="/"
              element={
                <SignupPage
                  form={form}
                  loading={loading}
                  loadError={loadError}
                  onRetry={fetchForm}
                  t={t}
                />
              }
            />
            <Route
              path="/profile/:id"
              element={<ManagePage form={form} formLoading={loading} t={t} showSnackbar={showSnackbar} />}
            />
            <Route
              path="/profile/:id/edit"
              element={<ManagePage form={form} formLoading={loading} t={t} showSnackbar={showSnackbar} />}
            />
            <Route path="/health" element={<HealthPage t={t} />} />
            <Route path="*" element={<NotFoundPage t={t} />} />
          </Routes>
        </main>
      </div>

      <Footer />
      <Snackbar message={snackbar?.msg} type={snackbar?.type} onClose={hideSnackbar} />
    </div>
  )
}
