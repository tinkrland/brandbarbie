import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TreeNode } from '@/lib/content'
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react'

interface Props {
  nodes: TreeNode[]
  depth?: number
  currentSlug?: string
}

function TreeItem({ node, depth, currentSlug }: { node: TreeNode; depth: number; currentSlug?: string }) {
  const [open, setOpen] = useState(depth < 1)
  const isActive = node.slug === currentSlug

  if (node.isFolder) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 w-full px-2 py-[5px] text-left rounded transition-colors hover:bg-white/8 text-sidebar-foreground/70 hover:text-sidebar-foreground text-[13px]"
        >
          <span className="text-sidebar-foreground/40 flex-shrink-0">
            {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </span>
          <span className="flex-shrink-0 text-sidebar-foreground/50">
            {open ? <FolderOpen size={11} /> : <Folder size={11} />}
          </span>
          <span className="truncate">{node.name}</span>
        </button>
        {open && (
          <div className="ml-3 border-l border-white/8 pl-0.5">
            <PageTree nodes={node.children} depth={depth + 1} currentSlug={currentSlug} />
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      to={`/note/${node.slug}`}
      className={`flex items-center gap-1.5 px-2 py-[5px] rounded text-[13px] transition-colors truncate ${
        isActive
          ? 'bg-white/15 text-white font-medium'
          : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-white/8'
      }`}
    >
      <FileText size={11} className="flex-shrink-0 opacity-50" />
      <span className="truncate">{node.name}</span>
    </Link>
  )
}

export default function PageTree({ nodes, depth = 0, currentSlug }: Props) {
  return (
    <div className="space-y-0.5">
      {nodes.map(node => (
        <TreeItem key={`${node.name}-${node.slug}`} node={node} depth={depth} currentSlug={currentSlug} />
      ))}
    </div>
  )
}
