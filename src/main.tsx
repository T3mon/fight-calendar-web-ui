import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n.ts'
import App from './App.tsx'
import { faviconHref } from './envTheme.ts'
import { applyTheme, getInitialTheme } from './theme.ts'

const faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
if (faviconLink) {
  faviconLink.href = faviconHref
}

// Runs before the first paint - index.html hardcodes data-bs-theme="dark"
// as the no-JS/no-flash fallback, this corrects it synchronously for
// anyone who has actually chosen (or whose OS prefers) light.
applyTheme(getInitialTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
