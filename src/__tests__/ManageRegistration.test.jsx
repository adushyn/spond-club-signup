import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ManageRegistration from '../components/ManageRegistration.jsx'
import { translations } from '../i18n/translations.js'

const t = translations.en

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MEMBER_TYPES = [
  { id: 'TYPE-ACTIVE', name: 'Active Member' },
  { id: 'TYPE-SOCIAL', name: 'Social Member' },
]

const form = { memberTypes: MEMBER_TYPES }

const reg = {
  id:             'uuid-123',
  memberTypeId:   'TYPE-ACTIVE',
  memberTypeName: 'Active Member',
  firstName:      'Jane',
  lastName:       'Doe',
  email:          'jane@example.com',
  phone:          '+47 123 45 678',
  birthDate:      '1990-06-15',
  submittedAt:    '2026-01-01T10:00:00Z',
}

// ── Mock fetch ────────────────────────────────────────────────────────────────

function mockFetch(response, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
  })
}

// Renders in view mode by default; pass mode="edit" for edit mode.
function renderManage(props = {}) {
  return render(
    <ManageRegistration
      registrationId="uuid-123"
      form={form}
      t={t}
      mode="view"
      onEdit={vi.fn()}
      onBackToView={vi.fn()}
      onDeleted={vi.fn()}
      onBack={vi.fn()}
      showSnackbar={vi.fn()}
      {...props}
    />
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ManageRegistration — loading', () => {
  it('shows skeleton while fetching', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) // never resolves
    renderManage()
    expect(document.querySelectorAll('.skeleton').length).toBeGreaterThan(0)
  })
})

describe('ManageRegistration — load error', () => {
  it('shows not-found message on 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) })
    renderManage()
    await waitFor(() => expect(screen.getByText(t.notFound)).toBeInTheDocument())
  })

  it('shows not-found message on 400 (malformed UUID)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400, json: () => Promise.resolve({}) })
    renderManage()
    await waitFor(() => expect(screen.getByText(t.notFound)).toBeInTheDocument())
  })

  it('shows retry button on network error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, json: () => Promise.resolve({}) })
    renderManage()
    await waitFor(() => expect(screen.getByText(t.retry ?? 'Try again')).toBeInTheDocument())
  })

  it('does not show retry button when registration is not found', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) })
    renderManage()
    await waitFor(() => screen.getByText(t.notFound))
    expect(screen.queryByText(t.retry ?? 'Try again')).not.toBeInTheDocument()
  })
})

describe('ManageRegistration — view mode', () => {
  beforeEach(() => mockFetch(reg))

  it('renders the manage page title', async () => {
    renderManage()
    await waitFor(() => expect(screen.getByText(t.manageTitle)).toBeInTheDocument())
  })

  it('shows the member type', async () => {
    renderManage()
    await waitFor(() => expect(screen.getByText('Active Member')).toBeInTheDocument())
  })

  it('shows first and last name', async () => {
    renderManage()
    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeInTheDocument()
      expect(screen.getByText('Doe')).toBeInTheDocument()
    })
  })

  it('shows email address', async () => {
    renderManage()
    await waitFor(() => expect(screen.getByText('jane@example.com')).toBeInTheDocument())
  })

  it('shows the Edit button', async () => {
    renderManage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: t.editRegistration })).toBeInTheDocument()
    )
  })

  it('does not show Delete button in view mode', async () => {
    renderManage()
    await waitFor(() => screen.getByText(t.manageTitle))
    expect(screen.queryByRole('button', { name: t.deleteRegistration })).not.toBeInTheDocument()
  })

  it('calls onEdit when Edit is clicked', async () => {
    const onEdit = vi.fn()
    renderManage({ onEdit })
    await waitFor(() => screen.getByRole('button', { name: t.editRegistration }))
    fireEvent.click(screen.getByRole('button', { name: t.editRegistration }))
    expect(onEdit).toHaveBeenCalled()
  })

  it('calls onBack when Back is clicked', async () => {
    const onBack = vi.fn()
    renderManage({ onBack })
    await waitFor(() => screen.getByRole('button', { name: t.goHome ?? t.registerAnother }))
    fireEvent.click(screen.getByRole('button', { name: t.goHome ?? t.registerAnother }))
    expect(onBack).toHaveBeenCalled()
  })
})

describe('ManageRegistration — delete modal (edit mode)', () => {
  beforeEach(() => mockFetch(reg))

  it('shows the Delete button in edit mode', async () => {
    renderManage({ mode: 'edit' })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: t.deleteRegistration })).toBeInTheDocument()
    )
  })

  it('opens the confirmation modal when Delete is clicked', async () => {
    renderManage({ mode: 'edit' })
    await waitFor(() => screen.getByRole('button', { name: t.deleteRegistration }))
    fireEvent.click(screen.getByRole('button', { name: t.deleteRegistration }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(t.confirmDeleteTitle)).toBeInTheDocument()
  })

  it('closes the modal on Cancel', async () => {
    renderManage({ mode: 'edit' })
    await waitFor(() => screen.getByRole('button', { name: t.deleteRegistration }))
    fireEvent.click(screen.getByRole('button', { name: t.deleteRegistration }))
    fireEvent.click(screen.getByRole('button', { name: t.cancelBtn }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onDeleted after successful delete', async () => {
    const onDeleted = vi.fn()
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(reg) })
      .mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve({}) })

    renderManage({ mode: 'edit', onDeleted })
    await waitFor(() => screen.getByRole('button', { name: t.deleteRegistration }))
    fireEvent.click(screen.getByRole('button', { name: t.deleteRegistration }))
    fireEvent.click(screen.getByRole('button', { name: t.confirmDeleteBtn }))
    await waitFor(() => expect(onDeleted).toHaveBeenCalled())
  })
})

describe('ManageRegistration — edit mode', () => {
  beforeEach(() => mockFetch(reg))

  it('shows Save changes button in edit mode', async () => {
    renderManage({ mode: 'edit' })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: t.saveChanges })).toBeInTheDocument()
    )
  })

  it('shows member-type cards in edit mode', async () => {
    renderManage({ mode: 'edit' })
    await waitFor(() => screen.getByRole('button', { name: t.saveChanges }))
    expect(screen.getByText('Active Member')).toBeInTheDocument()
    expect(screen.getByText('Social Member')).toBeInTheDocument()
  })

  it('pre-selects the current member type', async () => {
    renderManage({ mode: 'edit' })
    await waitFor(() => screen.getByRole('button', { name: t.saveChanges }))
    const activeRadio = screen.getByRole('radio', { name: 'Active Member' })
    expect(activeRadio).toBeChecked()
  })

  it('calls onBackToView when Back is clicked in edit mode', async () => {
    const onBackToView = vi.fn()
    renderManage({ mode: 'edit', onBackToView })
    await waitFor(() => screen.getByRole('button', { name: t.back }))
    fireEvent.click(screen.getByRole('button', { name: t.back }))
    expect(onBackToView).toHaveBeenCalled()
  })

  it('shows duplicate-email error from server on save', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(reg) })
      .mockResolvedValueOnce({
        ok: false, status: 409,
        json: () => Promise.resolve({ error: 'this email address is already registered for this form' }),
      })

    renderManage({ mode: 'edit' })
    await waitFor(() => screen.getByRole('button', { name: t.saveChanges }))
    fireEvent.click(screen.getByRole('button', { name: t.saveChanges }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('already registered')
    )
  })
})
