import { Sun, Moon } from 'lucide-react'
import { useMode } from '@/lib/mode'

export default function ModeToggle() {
  const { mode, setMode } = useMode()
  const isDark = mode === 'dark'
  return (
    <button
      onClick={() => setMode(isDark ? 'standard' : 'dark')}
      title={isDark ? 'Switch to light' : 'Switch to dark'}
      className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150"
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}
