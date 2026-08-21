import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { useTheme } from '../ThemeProvider'

function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      position="top-center"
      closeButton
      // Clears the notch / status bar so toasts stay readable in standalone PWA mode
      offset={{ left: '1rem', right: '1rem', top: 'calc(1rem + env(safe-area-inset-top))' }}
      mobileOffset={{ left: '0.75rem', right: '0.75rem', top: 'calc(0.75rem + env(safe-area-inset-top))' }}
      toastOptions={{
        classNames: {
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          description: 'group-[.toast]:text-muted-foreground',
          error: 'group-[.toast]:text-destructive',
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
