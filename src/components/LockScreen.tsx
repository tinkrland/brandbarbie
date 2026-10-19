import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface Props {
  slug: string
  title: string
  onUnlock: () => void
  correctPassword: string
}

export default function LockScreen({ slug, title, onUnlock, correctPassword }: Props) {
  const [input, setInput] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const attempt = () => {
    if (input === correctPassword) {
      sessionStorage.setItem(`qw-unlock-${slug}`, '1')
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setTimeout(() => setError(false), 2000)
      setInput('')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] select-none">
      {/* Lock icon */}
      <div className="mb-7 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border border-border/60">
          <Lock size={22} className="text-muted-foreground/60" />
        </div>
        <h1 className="font-serif text-[1.55rem] font-light text-foreground leading-tight tracking-tight text-center">
          {title}
        </h1>
        <p className="text-[12px] text-muted-foreground/55 text-center max-w-[22rem] leading-relaxed">
          this note is password protected. enter the password to read it.
        </p>
      </div>

      {/* Input */}
      <div
        className={`flex w-full max-w-[20rem] items-center gap-0 border rounded-md overflow-hidden transition-all duration-150 ${
          error
            ? 'border-destructive/60 bg-destructive/5'
            : 'border-border bg-card'
        } ${shake ? 'animate-shake' : ''}`}
      >
        <input
          type={show ? 'text' : 'password'}
          value={input}
          onChange={e => { setInput(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="enter password…"
          autoFocus
          className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/35 px-3.5 py-2.5 outline-none font-mono tracking-wider"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="px-3 py-2.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-[11px] text-destructive/70">incorrect password</p>
      )}

      <button
        onClick={attempt}
        disabled={!input}
        className="mt-4 px-6 py-2 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      >
        unlock
      </button>

      <p className="mt-8 text-[10px] text-muted-foreground/25 tracking-wide">
        password is remembered for this session only
      </p>
    </div>
  )
}
