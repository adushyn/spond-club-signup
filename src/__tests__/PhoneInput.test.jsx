import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PhoneInput from '../components/PhoneInput.jsx'
import { translations } from '../i18n/translations.js'

const t = translations.en

function renderInput(props = {}) {
  return render(
    <PhoneInput
      label={t.phone}
      value="+47 123 45 678"
      error={null}
      onChange={vi.fn()}
      t={t}
      {...props}
    />
  )
}

describe('PhoneInput', () => {
  it('renders the label', () => {
    renderInput()
    expect(screen.getByText(t.phone)).toBeInTheDocument()
  })

  it('renders the local number from the combined value', () => {
    renderInput({ value: '+47 123 45 678' })
    expect(screen.getByRole('textbox')).toHaveValue('123 45 678')
  })

  it('shows the phone hint text when no error', () => {
    renderInput({ error: null })
    expect(screen.getByText(/select your country code/i)).toBeInTheDocument()
  })

  it('hides the hint and shows error when error prop is set', () => {
    renderInput({ error: t.phoneInvalid })
    expect(screen.queryByText(t.phoneHint)).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(t.phoneInvalid)
  })

  it('calls onChange with combined "+code local" value when local number changes', () => {
    const onChange = vi.fn()
    renderInput({ value: '+47 ', onChange })
    fireEvent.change(screen.getByRole('textbox'), {
      target: { name: 'phone', value: '987 65 432' },
    })
    expect(onChange).toHaveBeenCalled()
    const call = onChange.mock.calls[0][0]
    expect(call.target.value).toMatch(/^\+47 987 65 432/)
  })

  it('marks the local input as aria-invalid when error is set', () => {
    renderInput({ error: 'Invalid phone' })
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('opens the country dropdown when the flag button is clicked', () => {
    renderInput()
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)
    // dropdown should now show country list
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('parses a +44 value and shows correct flag', () => {
    renderInput({ value: '+44 7911 123456' })
    expect(screen.getByRole('button')).toHaveTextContent('🇬🇧')
  })

  it('defaults to Norwegian (+47) when value is empty', () => {
    renderInput({ value: '' })
    expect(screen.getByRole('button')).toHaveTextContent('🇳🇴')
  })
})
