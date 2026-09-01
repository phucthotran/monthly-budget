/** Matches Tailwind slate-100 / slate-900 used as the app shell canvas. */
export const PWA_THEME_COLOR_DARK = '#0f172a'
export const PWA_THEME_COLOR_LIGHT = '#f1f5f9'

export function applyPwaThemeColor(isDark: boolean) {
  const color = isDark ? PWA_THEME_COLOR_DARK : PWA_THEME_COLOR_LIGHT
  const metas = [...document.querySelectorAll('meta[name="theme-color"]')]
  if (metas.length === 0) {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', color)
    document.head.appendChild(meta)
    return
  }
  const [first, ...rest] = metas
  first.setAttribute('content', color)
  first.removeAttribute('media')
  for (const extra of rest) extra.remove()
}
