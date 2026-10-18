import { ReactNode, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import LeftSidebar from './LeftSidebar'
import ModeToggle from './ModeToggle'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

interface Props {
  children: ReactNode
  currentSlug?: string
  rightPanel?: ReactNode
}

export default function Layout({ children, currentSlug, rightPanel }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden below md, replaced by the drawer */}
      <LeftSidebar currentSlug={currentSlug} />

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[240px] border-sidebar-border bg-sidebar overflow-hidden">
          <SheetTitle className="sr-only">navigation</SheetTitle>
          <LeftSidebar currentSlug={currentSlug} inDrawer />
        </SheetContent>
      </Sheet>

      {/* Main scrollable content — no visible scrollbar */}
      <main className="flex-1 overflow-y-auto min-w-0 no-scrollbar">
        {/* Sticky mode bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-2 bg-background/70 backdrop-blur-md border-b border-border/20">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-muted-foreground/60 hover:text-foreground transition-colors"
            title="open navigation"
          >
            <Menu size={16} />
          </button>
          <ModeToggle />
        </div>

        <div className="px-6 py-8 max-w-3xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Right panel — independently scrollable, no visible scrollbar */}
      {rightPanel && (
        <div className="hidden xl:flex flex-shrink-0 no-scrollbar">
          {rightPanel}
        </div>
      )}
    </div>
  )
}
