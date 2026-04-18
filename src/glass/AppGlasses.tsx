import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useGlasses } from 'even-toolkit/useGlasses'
import { useFlashPhase } from 'even-toolkit/useFlashPhase'
import { createScreenMapper, getHomeTiles } from 'even-toolkit/glass-router'
import { appSplash } from './splash'
import { toDisplayData, onGlassAction, type AppSnapshot } from './selectors'
import type { AppActions } from './shared'
import { usePresentation } from '../contexts/PresentationContext'

const deriveScreen = createScreenMapper([
  { pattern: '/', screen: 'home' },
  { pattern: '/present/*', screen: 'presenter' },
], 'home')

const homeTiles = getHomeTiles(appSplash)

export function AppGlasses() {
  const navigate = useNavigate()
  const location = useLocation()
  const { presentations, activePresentation, activeSlide, activeSlideIndex, nextSlide, prevSlide } = usePresentation()
  const [notePage, setNotePage] = useState(0)

  const currentScreen = deriveScreen(location.pathname)
  const flashPhase = useFlashPhase(currentScreen === 'home')

  // Reset note page when slide changes
  const prevSlideIndexRef = useRef(activeSlideIndex)
  if (prevSlideIndexRef.current !== activeSlideIndex) {
    prevSlideIndexRef.current = activeSlideIndex
    setNotePage(0)
  }

  const snapshotRef = useMemo(() => ({
    current: null as AppSnapshot | null,
  }), [])

  const snapshot: AppSnapshot = {
    isPresenting: Boolean(activePresentation),
    slideTitle: activeSlide?.title ?? '',
    slideNotes: activeSlide?.notes ?? '',
    slideIndex: activeSlideIndex,
    totalSlides: activePresentation?.slides.length ?? 0,
    notePage,
    totalNotePages: 1,
    items: presentations.length > 0
      ? presentations.map((p) => `${p.title} (${p.slides.length})`)
      : ['No presentations'],
    flashPhase,
  }
  snapshotRef.current = snapshot

  const getSnapshot = useCallback(() => snapshotRef.current!, [snapshotRef])

  const ctxRef = useRef<AppActions>({ navigate, nextSlide, prevSlide, setNotePage })
  ctxRef.current = { navigate, nextSlide, prevSlide, setNotePage }

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
