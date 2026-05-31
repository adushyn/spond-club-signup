import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm, usePersistentStep } from '../hooks/useForm.js'

const INITIAL = {
  firstName: '',
  lastName:  '',
  email:     '',
  phone:     '',
  birthDate: '',
  website:   '',
}

// Clear sessionStorage before each test
beforeEach(() => sessionStorage.clear())
afterEach(() => sessionStorage.clear())

// ── useForm ───────────────────────────────────────────────────────────────────
describe('useForm', () => {
  it('initialises with provided values', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    expect(result.current.values).toEqual(INITIAL)
    expect(result.current.errors).toEqual({})
  })

  it('handleChange updates a field', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    act(() => {
      result.current.handleChange({ target: { name: 'firstName', value: 'Jane' } })
    })
    expect(result.current.values.firstName).toBe('Jane')
  })

  it('setValue updates a field', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    act(() => {
      result.current.setValue('email', 'test@example.com')
    })
    expect(result.current.values.email).toBe('test@example.com')
  })

  it('setFieldErrors sets multiple errors', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    act(() => {
      result.current.setFieldErrors({ firstName: 'Required', email: 'Invalid' })
    })
    expect(result.current.errors.firstName).toBe('Required')
    expect(result.current.errors.email).toBe('Invalid')
  })

  it('setValue clears the error for that field', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    act(() => {
      result.current.setFieldErrors({ firstName: 'Required' })
    })
    expect(result.current.errors.firstName).toBe('Required')
    act(() => {
      result.current.setValue('firstName', 'Jane')
    })
    expect(result.current.errors.firstName).toBeUndefined()
  })

  it('handleBlur records touched state', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    act(() => {
      result.current.handleBlur({ target: { name: 'email' } })
    })
    expect(result.current.touched.email).toBe(true)
  })

  it('reset restores initial values and clears errors', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    act(() => {
      result.current.setValue('firstName', 'Jane')
      result.current.setFieldErrors({ firstName: 'Required' })
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.values).toEqual(INITIAL)
    expect(result.current.errors).toEqual({})
  })

  it('persists values to sessionStorage (except honeypot)', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    act(() => {
      result.current.setValue('firstName', 'Jane')
      result.current.setValue('website', 'bot-trap')
    })
    const stored = JSON.parse(sessionStorage.getItem('spond_wizard_values'))
    expect(stored.firstName).toBe('Jane')
    expect(stored.website).toBeUndefined()   // honeypot must not be persisted
  })

  it('restores values from sessionStorage on mount', () => {
    sessionStorage.setItem('spond_wizard_values', JSON.stringify({ firstName: 'Restored' }))
    const { result } = renderHook(() => useForm(INITIAL))
    expect(result.current.values.firstName).toBe('Restored')
  })

  it('reset clears user-entered data from sessionStorage', () => {
    const { result } = renderHook(() => useForm(INITIAL))
    act(() => {
      result.current.setValue('firstName', 'Jane')
    })
    // confirm it was persisted
    expect(JSON.parse(sessionStorage.getItem('spond_wizard_values')).firstName).toBe('Jane')

    act(() => {
      result.current.reset()
    })
    // after reset, values return to initial (empty); storage reflects that
    const stored = sessionStorage.getItem('spond_wizard_values')
    // either null or empty-initial values — either way, no user data remains
    if (stored !== null) {
      expect(JSON.parse(stored).firstName).toBe('')
    }
  })
})

// ── usePersistentStep ─────────────────────────────────────────────────────────
describe('usePersistentStep', () => {
  it('starts at provided initial step', () => {
    const { result } = renderHook(() => usePersistentStep(1))
    expect(result.current[0]).toBe(1)
  })

  it('setStep increments step', () => {
    const { result } = renderHook(() => usePersistentStep(1))
    act(() => {
      result.current[1](s => s + 1)
    })
    expect(result.current[0]).toBe(2)
  })

  it('persists step to sessionStorage', () => {
    const { result } = renderHook(() => usePersistentStep(1))
    act(() => {
      result.current[1](3)
    })
    expect(sessionStorage.getItem('spond_wizard_step')).toBe('3')
  })

  it('restores step from sessionStorage on mount', () => {
    sessionStorage.setItem('spond_wizard_step', '2')
    const { result } = renderHook(() => usePersistentStep(1))
    expect(result.current[0]).toBe(2)
  })
})
