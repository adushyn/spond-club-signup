export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <a href="https://www.spond.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.spond.com/app/themes/sozo/public/images/svg_icons/logo.svg"
            alt="Spond"
            className="footer-logo"
            onError={e => { e.target.style.display = 'none' }}
          />
        </a>
      </div>
    </footer>
  )
}
