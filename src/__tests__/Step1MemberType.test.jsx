import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Step1MemberType from '../components/Step1MemberType.jsx'
import { translations } from '../i18n/translations.js'

const t = translations.en

const FORM = {
  formId:   'form-1',
  title:    'Coding Camp 2025',
  memberTypes: [
    { id: 'MT-ACTIVE',  name: 'Active Member' },
    { id: 'MT-SOCIAL',  name: 'Social Member' },
  ],
  registrationOpens: new Date(Date.now() - 1000).toISOString(),
}

function makeValues(memberTypeId = '') {
  return { memberTypeId }
}

describe('Step1MemberType', () => {
  it('renders the form title', () => {
    render(
      <Step1MemberType
        form={FORM}
        values={makeValues()}
        error={null}
        onChange={vi.fn()}
        onNext={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByText('Coding Camp 2025')).toBeInTheDocument()
  })

  it('renders all member type options', () => {
    render(
      <Step1MemberType
        form={FORM}
        values={makeValues()}
        error={null}
        onChange={vi.fn()}
        onNext={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByText('Active Member')).toBeInTheDocument()
    expect(screen.getByText('Social Member')).toBeInTheDocument()
  })

  it('Next button is disabled when no member type selected', () => {
    render(
      <Step1MemberType
        form={FORM}
        values={makeValues('')}
        error={null}
        onChange={vi.fn()}
        onNext={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('Next button is enabled when a member type is selected', () => {
    render(
      <Step1MemberType
        form={FORM}
        values={makeValues('MT-ACTIVE')}
        error={null}
        onChange={vi.fn()}
        onNext={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('calls onChange when a radio is clicked', () => {
    const onChange = vi.fn()
    render(
      <Step1MemberType
        form={FORM}
        values={makeValues()}
        error={null}
        onChange={onChange}
        onNext={vi.fn()}
        t={t}
      />
    )
    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios[0])
    expect(onChange).toHaveBeenCalledWith('memberTypeId', 'MT-ACTIVE')
  })

  it('calls onNext when Next button is clicked', () => {
    const onNext = vi.fn()
    render(
      <Step1MemberType
        form={FORM}
        values={makeValues('MT-ACTIVE')}
        error={null}
        onChange={vi.fn()}
        onNext={onNext}
        t={t}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('shows error message when error prop is provided', () => {
    render(
      <Step1MemberType
        form={FORM}
        values={makeValues()}
        error="Please choose a membership type"
        onChange={vi.fn()}
        onNext={vi.fn()}
        t={t}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Please choose a membership type')
  })

  it('marks selected member type card as selected', () => {
    const { container } = render(
      <Step1MemberType
        form={FORM}
        values={makeValues('MT-SOCIAL')}
        error={null}
        onChange={vi.fn()}
        onNext={vi.fn()}
        t={t}
      />
    )
    const cards = container.querySelectorAll('.member-type-card')
    expect(cards[0]).not.toHaveClass('selected')
    expect(cards[1]).toHaveClass('selected')
  })

  it('radio input is checked for the selected member type', () => {
    render(
      <Step1MemberType
        form={FORM}
        values={makeValues('MT-ACTIVE')}
        error={null}
        onChange={vi.fn()}
        onNext={vi.fn()}
        t={t}
      />
    )
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toBeChecked()
    expect(radios[1]).not.toBeChecked()
  })
})
