import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const THEME_STORAGE_KEY = 'theme'

type Theme = 'dark' | 'light' | 'system'

type ThemeContextValue = {
  resolvedTheme: 'dark' | 'light'
  setTheme: (t: Theme) => void
  theme: Theme
}

const ThemeContext = createContext<null | ThemeContextValue>(null)

function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') {
      return v
    }
  } catch {
    // localStorage may be unavailable (private mode, SSR).
  }
  return 'system'
}

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyHtmlClass(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (typeof window !== 'undefined' ? readStoredTheme() : 'system'))
  const [systemIsDark, setSystemIsDark] = useState(() => (typeof window !== 'undefined' ? systemPrefersDark() : false))

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      setSystemIsDark(mq.matches)
    }
    mq.addEventListener('change', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
    }
  }, [])

  const resolvedTheme: 'dark' | 'light' = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'dark' : 'light'
    }
    return theme
  }, [systemIsDark, theme])

  useEffect(() => {
    applyHtmlClass(resolvedTheme === 'dark')
  }, [resolvedTheme])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // localStorage may be unavailable.
    }
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({ resolvedTheme, setTheme, theme }), [resolvedTheme, setTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
