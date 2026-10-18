import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, PanelLeftClose, PanelLeft, Github, Twitter, Globe, Mail, Linkedin, ExternalLink, Hash } from 'lucide-react';

import { buildTree, searchPages } from '@/lib/content';
import { profile } from '@/lib/profile';
import PageTree from './PageTree';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
interface Props {
  currentSlug?: string;
  inDrawer?: boolean;
}
const ICON_MAP = {
  github: Github,
  twitter: Twitter,
  globe: Globe,
  mail: Mail,
  linkedin: Linkedin
};
function Avatar({
  size = 'sm'
}: {
  size?: 'sm' | 'lg';
}) {
  const initials = (profile.initials || profile.name.split(' ').map(w => w[0]).join('')).slice(0, 2).toUpperCase();
  const dim = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-[10px]';
  return <div className={`${dim} rounded-full flex-shrink-0 flex items-center justify-center font-semibold overflow-hidden bg-sidebar-accent text-sidebar-foreground/70`}>
      {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" /> : initials}
    </div>;
}
function ProfileSection({
  collapsed
}: {
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (collapsed) {
    return <div className="flex justify-center py-3 border-t border-sidebar-border flex-shrink-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button title={profile.name}><Avatar /></button>
          </PopoverTrigger>
          <ProfilePopover />
        </Popover>
      </div>;
  }
  return <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center gap-2.5 px-4 py-3 border-t border-sidebar-border hover:bg-white/5 transition-colors text-left flex-shrink-0">
          <Avatar />
          <div className="min-w-0 flex-1">
            <div className="text-sidebar-foreground/80 text-[12px] font-medium truncate leading-tight">{profile.name}</div>
            <div className="text-sidebar-foreground/35 text-[10px] truncate leading-tight">@{profile.handle}</div>
          </div>
        </button>
      </PopoverTrigger>
      <ProfilePopover />
    </Popover>;
}
function ProfilePopover() {
  const initials = (profile.initials || profile.name.split(' ').map(w => w[0]).join('')).slice(0, 2).toUpperCase();
  return <PopoverContent side="top" align="start" className="w-56 p-0 bg-sidebar border-sidebar-border shadow-xl" sideOffset={4}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2.5 overflow-hidden bg-sidebar-accent text-sidebar-foreground/70">
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="text-sidebar-foreground text-[13px] font-semibold leading-tight">{profile.name}</div>
        <div className="text-sidebar-foreground/40 text-[10px] leading-tight mt-0.5">@{profile.handle}</div>
        {profile.bio && <div className="text-sidebar-foreground/55 text-[11px] mt-2 leading-snug">{profile.bio}</div>}
      </div>
      {profile.links.length > 0 && <div className="p-2">
          {profile.links.map(link => {
        const Icon = ICON_MAP[link.icon as keyof typeof ICON_MAP] || Globe;
        return <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-white/8 transition-colors group">
                <Icon size={13} className="text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70 transition-colors" />
                <span className="text-sidebar-foreground/55 group-hover:text-sidebar-foreground text-[11px] transition-colors flex-1">{link.label}</span>
                <ExternalLink size={9} className="text-sidebar-foreground/20 group-hover:text-sidebar-foreground/40 transition-colors" />
              </a>;
      })}
        </div>}
    </PopoverContent>;
}
function BrandMark({
  size = 'md'
}: {
  size?: 'md' | 'sm';
}) {
  const dim = size === 'md' ? 'w-8 h-8' : 'w-6 h-6';
  const text = size === 'md' ? 'text-base' : 'text-sm';
  return <div className={`${dim} rounded-lg bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500 flex items-center justify-center flex-shrink-0`}>
      <span className={`font-serif text-white ${text} font-bold leading-none lowercase`}>bb</span>
    </div>;
}
export default function LeftSidebar({
  currentSlug,
  inDrawer
}: Props) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const tree = useMemo(() => buildTree(), []);
  const results = useMemo(() => query.trim() ? searchPages(query) : [], [query]);
  return <aside className={`${inDrawer ? 'flex' : 'hidden md:flex'} flex-shrink-0 bg-sidebar h-screen flex-col select-none no-scrollbar transition-all duration-200 ease-in-out`} style={{
    width: collapsed ? '52px' : '240px'
  }}>
      {/* Header */}
      <div className={`flex items-center border-b border-sidebar-border flex-shrink-0 ${collapsed ? 'justify-center py-4 px-2 flex-col gap-2' : 'justify-between px-4 py-4'}`}>
        {!collapsed && <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity min-w-0">
            <BrandMark />
            <div className="min-w-0">
              <div className='text-sidebar-foreground font-semibold tracking-tight font-serif truncate text-xl'>brandbarbie</div>
              <div className="text-sidebar-foreground/35 text-[9px] leading-tight truncate">the brand book</div>
            </div>
          </Link>}
        {collapsed && <Link to="/" className="hover:opacity-80 transition-opacity">
            <BrandMark size="sm" />
          </Link>}
        <button onClick={() => setCollapsed(c => !c)} className="text-sidebar-foreground/30 hover:text-sidebar-foreground/65 transition-colors flex-shrink-0" title={collapsed ? 'expand sidebar' : 'collapse sidebar'}>
          {collapsed ? <PanelLeft size={12} /> : <PanelLeftClose size={12} />}
        </button>
      </div>

      {/* Collapsed icon strip */}
      {collapsed && <div className="flex flex-col items-center gap-3 py-3 px-2 flex-1">
          <button onClick={() => setCollapsed(false)} className="text-sidebar-foreground/35 hover:text-sidebar-foreground/65 transition-colors" title="search">
            <Search size={14} />
          </button>
        </div>}

      {/* Expanded content */}
      {!collapsed && <>
          {/* Search */}
          <div className="px-3 py-2.5 border-b border-sidebar-border flex-shrink-0">
            <div className="relative">
              <Search size={11} className="absolute top-1/2 -translate-y-1/2 text-sidebar-foreground/30 pointer-events-none" style={{
            left: '9px'
          }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="search notes..." className="sidebar-search w-full bg-white/5 text-sidebar-foreground text-[12px] rounded border border-sidebar-border transition-colors" style={{
            paddingLeft: '26px',
            paddingRight: query ? '26px' : '8px',
            paddingTop: '6px',
            paddingBottom: '6px'
          }} />
              {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-sidebar-foreground/30 hover:text-sidebar-foreground">
                  <X size={10} />
                </button>}
            </div>
          </div>

          {/* Search results */}
          {query && <div className="px-2 py-2 border-b border-sidebar-border flex-shrink-0">
              {results.length === 0 ? <p className="text-[11px] text-sidebar-foreground/30 px-2 py-1">no results</p> : <div className="space-y-0.5">
                    {results.slice(0, 8).map(p => <button key={p.slug} onClick={() => {
            navigate(`/note/${p.slug}`);
            setQuery('');
          }} className="w-full text-left px-2 py-1.5 rounded hover:bg-white/8 text-sidebar-foreground/60 hover:text-sidebar-foreground text-[12px] truncate transition-colors">
                        {p.title}
                      </button>)}
                  </div>}
            </div>}

          {/* Tree */}
          {!query && <div className="px-2 py-3 flex-1 overflow-y-auto no-scrollbar">
              <p className="text-[9px] uppercase tracking-widest text-sidebar-foreground/22 px-2 mb-2">pages</p>
              <PageTree nodes={tree.children} currentSlug={currentSlug} />
            </div>}
        </>}

      {/* Quick nav links */}
      {!collapsed && <div className="px-4 py-2.5 border-t border-sidebar-border flex-shrink-0 flex items-center gap-4">
          <Link to="/search" className="flex items-center gap-1.5 text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
            <Search size={11} /> search
          </Link>
          <Link to="/tags" className="flex items-center gap-1.5 text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
            <Hash size={11} /> tags
          </Link>
        </div>}

      {/* Profile — always visible */}
      <ProfileSection collapsed={collapsed} />
    </aside>;
}
