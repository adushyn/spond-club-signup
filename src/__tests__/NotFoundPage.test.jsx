import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import { translations } from '../i18n/translations.js'

const t = translations.en

function renderPage(locale = t) {
  return render(
    <MemoryRouter>
      <NotFoundPage t={locale} />
    </MemoryRouter>
  )
}

describe('NotFoundPage', () => {
  it('renders the page-not-found heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(t.pageNotFound)
  })

  it('renders the description text', () => {
    renderPage()
    expect(screen.getByText(t.pageNotFoundDesc)).toBeInTheDocument()
  })

  it('renders a back-to-registration link', () => {
    renderPage()
    const link = screen.getByRole('link')
    expect(link).toHaveTextContent(t.goHome)
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders Norwegian text when t=no', () => {
    const no = translations.no
    renderPage(no)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(no.pageNotFound)
    expect(screen.getByRole('link')).toHaveTextContent(no.goHome)
  })

  it('falls back gracefully when t prop is undefined', () => {
    render(
      <MemoryRouter>
        <NotFoundPage t={undefined} />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Page not found')
  })
})
