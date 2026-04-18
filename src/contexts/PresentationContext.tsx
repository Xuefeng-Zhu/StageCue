import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Presentation, Slide } from '../types'
import { generateId } from '../types'

interface PresentationContextValue {
  presentations: Presentation[]
  addPresentation: (title: string) => Presentation
  updatePresentation: (id: string, title: string) => void
  deletePresentation: (id: string) => void
  addSlide: (presentationId: string, title: string, notes: string) => void
  updateSlide: (presentationId: string, slideId: string, title: string, notes: string) => void
  deleteSlide: (presentationId: string, slideId: string) => void
  reorderSlides: (presentationId: string, fromIndex: number, toIndex: number) => void
  importPresentation: (title: string, slides: { title: string; notes: string }[]) => Presentation
  // Presenting state
  activePresentationId: string | null
  activeSlideIndex: number
  startPresenting: (presentationId: string) => void
  stopPresenting: () => void
  goToSlide: (index: number) => void
  nextSlide: () => void
  prevSlide: () => void
  activePresentation: Presentation | null
  activeSlide: Slide | null
}

const PresentationContext = createContext<PresentationContextValue | null>(null)

const STORAGE_KEY = 'StageCue-presentations'

const SAMPLE_PRESENTATIONS: Presentation[] = [
  {
    id: 'sample-1',
    title: 'Q2 Product Roadmap',
    slides: [
      {
        id: 's1',
        title: 'Welcome & Agenda',
        notes: 'Welcome everyone to the Q2 roadmap review.\n\nToday we will cover:\n- Key metrics from Q1\n- Product priorities for Q2\n- Timeline and milestones\n- Open discussion',
      },
      {
        id: 's2',
        title: 'Q1 Recap',
        notes: 'Q1 highlights:\n- 23% growth in active users\n- Launched mobile app v2.0\n- NPS improved from 42 to 58\n\nAreas to improve:\n- Onboarding completion rate still at 61%\n- Support ticket volume up 15%',
      },
      {
        id: 's3',
        title: 'Q2 Priorities',
        notes: 'Three pillars for Q2:\n\n1. Onboarding redesign — target 80% completion\n2. Performance optimization — 50% faster load times\n3. Enterprise features — SSO, audit logs, admin dashboard\n\nEach pillar has a dedicated squad.',
      },
      {
        id: 's4',
        title: 'Timeline',
        notes: 'April: Onboarding redesign ships\nMay: Performance sprint + enterprise beta\nJune: Enterprise GA + Q3 planning\n\nKey dates:\n- April 15: Design review\n- May 1: Beta invites\n- June 15: Launch event',
      },
      {
        id: 's5',
        title: 'Q&A',
        notes: 'Open the floor for questions.\n\nPrepared answers:\n- Budget: approved, no changes\n- Hiring: 2 engineers joining in April\n- Competitors: monitoring but staying focused on our roadmap',
      },
    ],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'sample-2',
    title: 'Team Standup Template',
    slides: [
      {
        id: 's1',
        title: 'Yesterday',
        notes: 'What was accomplished yesterday:\n- Completed feature X\n- Code review for PR #123\n- Fixed bug in auth flow',
      },
      {
        id: 's2',
        title: 'Today',
        notes: 'Plan for today:\n- Start work on feature Y\n- Meet with design team at 2pm\n- Update documentation',
      },
      {
        id: 's3',
        title: 'Blockers',
        notes: 'Current blockers:\n- Waiting on API spec from backend team\n- Need access to staging environment\n\nAction items:\n- Follow up with backend lead\n- Submit access request',
      },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
]

function loadPresentations(): Presentation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return SAMPLE_PRESENTATIONS
}

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [presentations, setPresentations] = useState<Presentation[]>(loadPresentations)
  const [activePresentationId, setActivePresentationId] = useState<string | null>(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations))
  }, [presentations])

  const addPresentation = useCallback((title: string): Presentation => {
    const now = Date.now()
    const pres: Presentation = {
      id: generateId(),
      title,
      slides: [{ id: generateId(), title: 'Slide 1', notes: '' }],
      createdAt: now,
      updatedAt: now,
    }
    setPresentations((prev) => [pres, ...prev])
    return pres
  }, [])

  const updatePresentation = useCallback((id: string, title: string) => {
    setPresentations((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title, updatedAt: Date.now() } : p)),
    )
  }, [])

  const deletePresentation = useCallback((id: string) => {
    setPresentations((prev) => prev.filter((p) => p.id !== id))
    if (activePresentationId === id) {
      setActivePresentationId(null)
      setActiveSlideIndex(0)
    }
  }, [activePresentationId])

  const addSlide = useCallback((presentationId: string, title: string, notes: string) => {
    setPresentations((prev) =>
      prev.map((p) => {
        if (p.id !== presentationId) return p
        return {
          ...p,
          slides: [...p.slides, { id: generateId(), title, notes }],
          updatedAt: Date.now(),
        }
      }),
    )
  }, [])

  const updateSlide = useCallback((presentationId: string, slideId: string, title: string, notes: string) => {
    setPresentations((prev) =>
      prev.map((p) => {
        if (p.id !== presentationId) return p
        return {
          ...p,
          slides: p.slides.map((s) => (s.id === slideId ? { ...s, title, notes } : s)),
          updatedAt: Date.now(),
        }
      }),
    )
  }, [])

  const deleteSlide = useCallback((presentationId: string, slideId: string) => {
    setPresentations((prev) =>
      prev.map((p) => {
        if (p.id !== presentationId) return p
        const newSlides = p.slides.filter((s) => s.id !== slideId)
        if (newSlides.length === 0) return p // keep at least one slide
        return { ...p, slides: newSlides, updatedAt: Date.now() }
      }),
    )
  }, [])

  const reorderSlides = useCallback((presentationId: string, fromIndex: number, toIndex: number) => {
    setPresentations((prev) =>
      prev.map((p) => {
        if (p.id !== presentationId) return p
        const slides = [...p.slides]
        const [moved] = slides.splice(fromIndex, 1)
        slides.splice(toIndex, 0, moved)
        return { ...p, slides, updatedAt: Date.now() }
      }),
    )
  }, [])

  const importPresentation = useCallback((title: string, slides: { title: string; notes: string }[]): Presentation => {
    const now = Date.now()
    const pres: Presentation = {
      id: generateId(),
      title,
      slides: slides.map((s) => ({ id: generateId(), title: s.title, notes: s.notes })),
      createdAt: now,
      updatedAt: now,
    }
    if (pres.slides.length === 0) {
      pres.slides = [{ id: generateId(), title: 'Slide 1', notes: '' }]
    }
    setPresentations((prev) => [pres, ...prev])
    return pres
  }, [])

  const startPresenting = useCallback((presentationId: string) => {
    setActivePresentationId(presentationId)
    setActiveSlideIndex(0)
  }, [])

  const stopPresenting = useCallback(() => {
    setActivePresentationId(null)
    setActiveSlideIndex(0)
  }, [])

  const activePresentation = activePresentationId
    ? presentations.find((p) => p.id === activePresentationId) ?? null
    : null

  const totalSlides = activePresentation?.slides.length ?? 0

  const goToSlide = useCallback((index: number) => {
    setActiveSlideIndex(Math.max(0, Math.min(index, totalSlides - 1)))
  }, [totalSlides])

  const nextSlide = useCallback(() => {
    setActiveSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1))
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setActiveSlideIndex((prev) => Math.max(prev - 1, 0))
  }, [totalSlides])

  const activeSlide = activePresentation
    ? activePresentation.slides[activeSlideIndex] ?? null
    : null

  return (
    <PresentationContext.Provider
      value={{
        presentations,
        addPresentation,
        updatePresentation,
        deletePresentation,
        addSlide,
        updateSlide,
        deleteSlide,
        reorderSlides,
        importPresentation,
        activePresentationId,
        activeSlideIndex,
        startPresenting,
        stopPresenting,
        goToSlide,
        nextSlide,
        prevSlide,
        activePresentation,
        activeSlide,
      }}
    >
      {children}
    </PresentationContext.Provider>
  )
}

export function usePresentation() {
  const ctx = useContext(PresentationContext)
  if (!ctx) throw new Error('usePresentation must be used within PresentationProvider')
  return ctx
}
