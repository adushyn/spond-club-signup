import { useState, useCallback } from 'react'
import { useNavigate }    from 'react-router-dom'
import StepIndicator      from '../components/StepIndicator.jsx'
import Step1MemberType    from '../components/Step1MemberType.jsx'
import Step2PersonalInfo  from '../components/Step2PersonalInfo.jsx'
import Step3Preview       from '../components/Step3Preview.jsx'
import FutureDateBanner   from '../components/FutureDateBanner.jsx'
import SuccessBanner      from '../components/SuccessBanner.jsx'
import { useForm, usePersistentStep } from '../hooks/useForm.js'
import { validateStep2, normalizePhone } from '../validation.js'

const API_BASE      = import.meta.env.VITE_API_BASE_URL ?? ''
const TURNSTILE_KEY = import.meta.env.VITE_CF_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'

const IS_NETWORK_ERROR = (msg) =>
  !msg || msg === 'Failed to fetch' || msg.startsWith('NetworkError') || msg.startsWith('Load failed')

export default function SignupPage({ form, loading, loadError, onRetry, t }) {
  const navigate = useNavigate()

  const [step, setStep]               = usePersistentStep(1)
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitted, setSubmitted]     = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [registrationId, setRegistrationId] = useState(null)

  const { values, errors, handleChange, handleBlur, setValue, setFieldErrors, reset } = useForm({
    memberTypeId: '',
    firstName:    '',
    lastName:     '',
    email:        '',
    phone:        '',
    birthDate:    '',
    website:      '',
  })

  const goNext = useCallback(() => setStep(s => s + 1), [])
  const goBack = useCallback(() => { setSubmitError(null); setStep(s => s - 1) }, [])

  const handleStep2Next = useCallback(() => {
    const errs = validateStep2(values, t)
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    goNext()
  }, [values, t, setFieldErrors, goNext])

  const handleSubmit = useCallback(async (turnstileToken) => {
    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      formId:              form.formId,
      memberTypeId:        values.memberTypeId,
      firstName:           values.firstName.trim(),
      lastName:            values.lastName.trim(),
      email:               values.email.trim().toLowerCase(),
      phone:               normalizePhone(values.phone),
      birthDate:           values.birthDate,
      website:             values.website,
      cfTurnstileResponse: turnstileToken,
    }

    try {
      const res  = await fetch(`${API_BASE}/api/registrations`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        const msg = data?.error || t.errorOccurred
        if (data?.fields) setFieldErrors(data.fields)
        setSubmitError(msg)
        return
      }
      setSubmittedName(values.firstName.trim())
      setRegistrationId(data.id)
      setSubmitted(true)
      reset()
    } catch {
      setSubmitError(t.networkError)
    } finally {
      setSubmitting(false)
    }
  }, [form, values, t, setFieldErrors, reset])

  // ── Skeleton ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 28, width: '70%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 28 }} />
        {[1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 10 }} />
        ))}
      </div>
    )
  }

  if (loadError) {
    const isNetwork = IS_NETWORK_ERROR(loadError)
    return (
      <div>
        <div className="banner banner--error">
          <span className="banner__icon">⚠️</span>
          <div>
            <div className="banner__title">{t.failedToLoad}</div>
            <div className="banner__body">
              {isNetwork
                ? t.networkErrorHint
                : `${t.errorOccurred} (${loadError})`}
            </div>
          </div>
        </div>
        {onRetry && (
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={onRetry}>
              {t.retry ?? 'Try again'}
            </button>
          </div>
        )}
      </div>
    )
  }

  const registrationOpen = form ? new Date(form.registrationOpens) <= new Date() : false

  // ── Success ─────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <SuccessBanner
        firstName={submittedName}
        t={t}
        onRestart={() => { setSubmitted(false); setRegistrationId(null); setStep(1) }}
        onManage={() => navigate(`/profile/${registrationId}`)}
      />
    )
  }

  // ── Wizard steps ─────────────────────────────────────────────────────────────

  return (
    <>
      {registrationOpen && <StepIndicator current={step} t={t} />}

      {step === 1 && (
        !registrationOpen
          ? <FutureDateBanner
              registrationOpens={form.registrationOpens}
              title={form.title}
              t={t}
            />
          : <Step1MemberType
              form={form}
              values={values}
              error={errors.memberTypeId}
              onChange={setValue}
              onNext={goNext}
              t={t}
            />
      )}

      {step === 2 && (
        <Step2PersonalInfo
          values={values}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          onNext={handleStep2Next}
          onBack={goBack}
          t={t}
        />
      )}

      {step === 3 && (
        <Step3Preview
          values={values}
          form={form}
          siteKey={TURNSTILE_KEY}
          submitting={submitting}
          submitError={submitError}
          onBack={goBack}
          onSubmit={handleSubmit}
          t={t}
        />
      )}
    </>
  )
}
