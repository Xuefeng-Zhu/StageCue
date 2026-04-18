import { useParams, useNavigate } from 'react-router'
import { Card, Badge, Button, EmptyState, useDrawerHeader } from 'even-toolkit/web'
import { usePresentation } from '../contexts/PresentationContext'

export function PresenterView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    activePresentation,
    activeSlide,
    activeSlideIndex,
    nextSlide,
    prevSlide,
    goToSlide,
    stopPresenting,
  } = usePresentation()

  useDrawerHeader({
    title: activePresentation?.title ?? 'Presenting',
  })

  if (!activePresentation || activePresentation.id !== id) {
    return (
      <main className="px-3 pt-4 pb-8">
        <EmptyState
          title="Not presenting"
          description="Start a presentation from the deck view."
          action={{ label: 'Back', onClick: () => navigate('/') }}
        />
      </main>
    )
  }

  const total = activePresentation.slides.length

  function handleStop() {
    stopPresenting()
    navigate(`/presentation/${id}`)
  }

  return (
    <main className="px-3 pt-4 pb-8 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="accent">LIVE</Badge>
          <span className="text-[13px] tracking-[-0.13px] text-text-dim">
            Slide {activeSlideIndex + 1} of {total}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleStop}>
          End
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-surface-light rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((activeSlideIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Current slide */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{activeSlideIndex + 1}</Badge>
          <h2 className="text-[17px] tracking-[-0.17px] text-text font-medium">
            {activeSlide?.title}
          </h2>
        </div>
        <p className="text-[15px] tracking-[-0.15px] text-text whitespace-pre-wrap leading-relaxed">
          {activeSlide?.notes || '(no notes)'}
        </p>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={prevSlide}
          disabled={activeSlideIndex === 0}
        >
          ← Previous
        </Button>
        <Button
          className="flex-1"
          onClick={nextSlide}
          disabled={activeSlideIndex === total - 1}
        >
          Next →
        </Button>
      </div>

      {/* Slide thumbnails */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
        {activePresentation.slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(i)}
            className={`flex-shrink-0 w-16 h-10 rounded-[4px] flex items-center justify-center text-[11px] tracking-[-0.11px] transition-all ${
              i === activeSlideIndex
                ? 'bg-accent text-white'
                : 'bg-surface-light text-text-dim'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <p className="text-[11px] tracking-[-0.11px] text-text-muted text-center">
        Notes are shown on your G2 glasses. Use ring swipe or tap to navigate.
      </p>
    </main>
  )
}
