import { useCallback, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useGlasses } from 'even-toolkit/useGlasses'
import { useFlashPhase } from 'even-toolkit/useFlashPhase'
import { createScreenMapper, getHomeTiles } from 'even-toolkit/glass-router'
import { appSplash } from './splash'
import { toDisplayData, onGlassAction, type AppSnapshot } from './selectors'
import type { AppActions } from './shared'
import { useNotes } from '../contexts/NotesContext'

const deriveScreen = createScreenMapper([
  { pattern: '/', screen: 'home' },
], 'home')

const homeTiles = getHomeTiles(appSplash)

export function AppGlasses() {
  const navigate = useNavigate()
  const location = useLocation()
  const { notes } = useNotes()
  const flashPhase = useFlashPhase(deriveScreen(location.pathname) === 'home')

  const snapshotRef = useMemo(() => ({
    current: null as AppSnapshot | null,
  }), [])

  const snapshot: AppSnapshot = {
    items: notes.length > 0
      ? notes.map((n) => n.title)
      : ['No notes yet'],
    flashPhase,
  }
  snapshotRef.current = snapshot

  const getSnapshot = useCallback(() => snapshotRef.current!, [snapshotRef])

  const ctxRef = useRef<AppActions>({ navigate })
  ctxRef.current = { navigate }

  const handleGlassAction = useCallback(
    (action: Parameters<typeof onGlassAction>[0], nav: Parameters<typeof onGlassAction>[1], snap: AppSnapshot) =>
      onGlassAction(action, nav, snap, ctxRef.current),
    [],
  )

  useGlasses({
    getSnapshot,
    toDisplayData,
    onGlassAction: handleGlassAction,
    deriveScreen,
    appName: 'STAGECUE',
    splash: appSplash,
    getPageMode: (screen) => screen === 'home' ? 'home' : 'text',
    homeImageTiles: homeTiles,
  })

  return null
}
