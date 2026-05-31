import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'spond_wizard_values'
const STEP_KEY    = 'spond_wizard_step'

/**
 * Form-state hook with sessionStorage persistence.
 * Values and current step survive a page refresh.
 * Everything is cleared on successful submission (call reset()).
 */
export function useForm(initialValues) {
  // Restore values from sessionStorage on first render
  const [values, setValues] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      return saved ? { ...initialValues, ...JSON.parse(saved) } : initialValues
    } catch {
      return initialValues
    }
  })

  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})

  // Persist values whenever they change (but never persist the honeypot)
  useEffect(() => {
    try {
      const { website, ...safe } = values   // strip honeypot before saving
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
    } catch { /* storage quota or private mode */ }
  }, [values])

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setErrors(prev => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const handleChange = useCallback(e => {
    setValue(e.target.name, e.target.value)
  }, [setValue])

  const handleBlur = useCallback(e => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }, [])

  const setFieldError = useCallback((name, msg) => {
    setErrors(prev => ({ ...prev, [name]: msg }))
  }, [])

  const setFieldErrors = useCallback(errs => {
    setErrors(prev => ({ ...prev, ...errs }))
  }, [])

  // Call this after successful submission to wipe persisted state
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STEP_KEY)
    } catch { /* ignore */ }
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    handleChange,
    handleBlur,
    setFieldError,
    setFieldErrors,
    reset,
  }
}

/** Persist and restore the current wizard step */
export function usePersistentStep(initial = 1) {
  const [step, setStepState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STEP_KEY)
      return saved ? Number(saved) : initial
    } catch {
      return initial
    }
  })

  const setStep = useCallback((updater) => {
    setStepState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try { sessionStorage.setItem(STEP_KEY, String(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  return [step, setStep]
}
