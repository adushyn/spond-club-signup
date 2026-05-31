import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Step2PersonalInfo from '../components/Step2PersonalInfo.jsx'
import { translations } from '../i18n/translations.js'

const t = translations.en

function makeValues(overrides = {}) {
  return {
    firstName: 'Jane',
    lastName:  'Doe',
    email:     'jane@example.com',
    phone:     '+44 7911 123456',
    birthDate: '1990-06-15',
    website:   '',
    ...overrides,
  }
}

describe('Step2PersonalInfo', () => {
  it('renders all form fields', () => {
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{}}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByLabelText(t.firstName)).toBeInTheDocument()
    expect(screen.getByLabelText(t.lastName)).toBeInTheDocument()
    expect(screen.getByLabelText(t.email)).toBeInTheDocument()
    expect(screen.getByLabelText(t.phone)).toBeInTheDocument()
    expect(screen.getByLabelText(t.dateOfBirth)).toBeInTheDocument()
  })

  it('renders Back and Next buttons', () => {
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{}}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('calls onNext when Next is clicked', () => {
    const onNext = vi.fn()
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{}}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={onNext}
        onBack={vi.fn()}
        t={t}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('calls onBack when Back is clicked', () => {
    const onBack = vi.fn()
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{}}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={onBack}
        t={t}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('calls onChange when a field is edited', () => {
    const onChange = vi.fn()
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{}}
        onChange={onChange}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    fireEvent.change(screen.getByLabelText(t.firstName), { target: { name: 'firstName', value: 'Alice' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('shows firstName error alert when errors.firstName is set', () => {
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{ firstName: 'First name is required' }}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('First name is required')
  })

  it('shows email error when errors.email is set', () => {
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{ email: 'Enter a valid email address' }}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    expect(screen.getAllByRole('alert').some(el => el.textContent.includes('valid email'))).toBe(true)
  })

  it('marks firstName input as aria-invalid when there is an error', () => {
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{ firstName: 'Required' }}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByLabelText(t.firstName)).toHaveAttribute('aria-invalid', 'true')
  })

  it('adds "error" class to invalid input', () => {
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{ email: 'Invalid email' }}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByLabelText(t.email)).toHaveClass('error')
  })

  it('shows phone hint when there is no phone error', () => {
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{}}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByText(/select your country code/i)).toBeInTheDocument()
  })

  it('hides phone hint when there is a phone error', () => {
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{ phone: 'Invalid phone' }}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={t}
      />
    )
    expect(screen.queryByText(/select your country code/i)).not.toBeInTheDocument()
  })

  it('renders Norwegian labels when t=no', () => {
    const no = translations.no
    render(
      <Step2PersonalInfo
        values={makeValues()}
        errors={{}}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        t={no}
      />
    )
    expect(screen.getByLabelText(no.firstName)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tilbake/i })).toBeInTheDocument()
  })
})
