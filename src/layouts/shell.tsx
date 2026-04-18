import { DrawerShell } from 'even-toolkit/web'
import type { SideDrawerItem } from 'even-toolkit/web'

const MENU_ITEMS: SideDrawerItem[] = [
  { id: '/', label: 'Notes', section: 'Notes' },
]

const BOTTOM_ITEMS: SideDrawerItem[] = [
  { id: '/settings', label: 'Settings', section: 'App' },
]

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'StageCue'
  if (pathname === '/new') return 'New Note'
  if (pathname.includes('/edit')) return 'Edit Note'
  if (pathname.startsWith('/note/')) return 'Note'
  if (pathname === '/settings') return 'Settings'
  return 'Notes'
}

function deriveActiveId(pathname: string): string {
  if (pathname === '/settings') return '/settings'
  return '/'
}

export function Shell() {
  return (
    <DrawerShell
      items={MENU_ITEMS}
      bottomItems={BOTTOM_ITEMS}
      title="StageCue"
      getPageTitle={getPageTitle}
      deriveActiveId={deriveActiveId}
    />
  )
}
