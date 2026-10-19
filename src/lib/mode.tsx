import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type AppMode = 'standard' | 'dark'

interface ModeCtx {
  mode: AppMode
  setMode: (m: AppMode) => void
}

const Ctx = createContext<ModeCtx>({ mode: 'standard', setMode: () => {} })

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('qw-mode') as AppMode
    return saved === 'dark' ? 'dark' : 'standard'
  })

  const setMode = (m: AppMode) => {
    setModeState(m)
    localStorage.setItem('qw-mode', m)
  }

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('mode-dark', 'mode-handwritten')
    if (mode === 'dark') html.classList.add('mode-dark')
  }, [mode])

  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>
}

export const useMode = () => useContext(Ctx)
