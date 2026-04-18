import { DrawerShell } from 'even-toolkit/web'
import type { SideDrawerItem } from 'even-toolkit/web'

const MENU_ITEMS: SideDrawerItem[] = [
  { id: '/', label: 'Presentations', section: 'Decks' },
]

const BOTTOM_ITEMS: SideDrawerItem[] = [
  { id: '/settings', label: 'Settings', section: 'App' },
]

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'StageCue'
  if (pathname.startsWith('/present/')) return 'Presenting'
  if (pathname.includes('/slide/')) return 'Edit Slide'
  if (pathname.startsWith('/presentation/')) return 'Deck'
  if (pathname === '/settings') return 'Settings'
  return 'StageCue'
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
