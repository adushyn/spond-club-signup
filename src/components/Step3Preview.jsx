import { useEffect, useRef } from 'react'

function PreviewRow({ label, value }) {
  return (
    <div className="preview-row">
      <span className="preview-row__label">{label}</span>
      <span className="preview-row__value">{value}</span>
    </div>
  )
}

// Errors that require going back to fix — submit must stay disabled
const PERMANENT_ERRORS = ['already registered', 'invalid form', 'invalid member type', 'validation failed']
const isPermanentError = (err) => err && PERMANENT_ERRORS.some(s => err.toLowerCase().includes(s))
const isDuplicateEmail = (err) => err && err.toLowerCase().includes('already registered')

export default function Step3Preview({ values, form, siteKey, submitting, submitError, onBack, onSubmit, t }) {
  const memberType   = form.memberTypes.find(mt => mt.id === values.memberTypeId)
  const turnstileRef = useRef(null)
  const widgetId     = useRef(null)
  const tokenRef     = useRef('')

  useEffect(() => {
    const render = () => {
      if (!turnstileRef.current || !window.turnstile) return
      if (widgetId.current != null) return
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback:           (token) => { tokenRef.current = token },
        'expired-callback': ()      => { tokenRef.current = '' },
        'error-callback':   ()      => { tokenRef.current = '' },
      })
    }

    if (window.turnstile) {
      render()
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) { render(); clearInterval(interval) }
      }, 100)
      return () => clearInterval(interval)
    }

    return () => {
      if (widgetId.current != null && window.turnstile) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = null
      }
    }
  }, [])

  const handleSubmit = () => onSubmit(tokenRef.current)

  return (
    <div>
      <h2 className="form-title">{t.reviewDetails}</h2>
      <p className="form-description">{t.reviewDetailsDesc}</p>

      <div className="preview-section">
        <div className="preview-section__title">{t.membership}</div>
        <PreviewRow label={t.form}       value={form.title} />
        <PreviewRow label={t.memberType} value={memberType?.name ?? '—'} />
      </div>

      <div className="preview-section">
        <div className="preview-section__title">{t.personalInfoLabel}</div>
        <PreviewRow label={t.firstName}   value={values.firstName} />
        <PreviewRow label={t.lastName}    value={values.lastName} />
        <PreviewRow label={t.email}       value={values.email} />
        <PreviewRow label={t.phone}       value={values.phone} />
        <PreviewRow label={t.dateOfBirth} value={values.birthDate} />
      </div>

      {submitError && (
        <div className="banner banner--error" role="alert" style={{ marginBottom: 0 }}>
          <span className="banner__icon">⚠️</span>
          <div>
            <div className="banner__title">{t.submissionFailed}</div>
            <div className="banner__body">{submitError}</div>
            {isDuplicateEmail(submitError) && (
              <div className="banner__hint">{t.emailAlreadyHint}</div>
            )}
          </div>
        </div>
      )}

      <div className="turnstile-wrap">
        <div ref={turnstileRef} />
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack} disabled={submitting}>
          {t.back}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting || isPermanentError(submitError)}
          title={isPermanentError(submitError) ? t.emailAlreadyHint : undefined}
        >
          {submitting ? <><span className="spinner" /> {t.submitting}</> : t.submitRegistration}
        </button>
      </div>
    </div>
  )
}
