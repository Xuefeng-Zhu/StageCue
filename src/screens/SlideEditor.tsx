import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Input, Textarea, Button, Card, EmptyState, useDrawerHeader } from 'even-toolkit/web'
import { usePresentation } from '../contexts/PresentationContext'

export function SlideEditor() {
  const { id, slideId } = useParams<{ id: string; slideId: string }>()
  const navigate = useNavigate()
  const { presentations, updateSlide } = usePresentation()

  const pres = presentations.find((p) => p.id === id)
  const slide = pres?.slides.find((s) => s.id === slideId)

  const [title, setTitle] = useState(slide?.title ?? '')
  const [notes, setNotes] = useState(slide?.notes ?? '')

  useEffect(() => {
    if (slide) {
      setTitle(slide.title)
      setNotes(slide.notes)
    }
  }, [slide])

  useDrawerHeader({
    title: slide ? `Edit: ${slide.title}` : 'Edit Slide',
    backTo: `/presentation/${id}`,
  })

  if (!pres || !slide) {
    return (
      <main className="px-3 pt-4 pb-8">
        <EmptyState
          title="Slide not found"
          action={{ label: 'Back', onClick: () => navigate(`/presentation/${id}`) }}
        />
      </main>
    )
  }

  function handleSave() {
    updateSlide(id!, slideId!, title.trim(), notes.trim())
    navigate(`/presentation/${id}`)
  }

  const charCount = notes.length
  const pageEstimate = Math.max(1, Math.ceil(charCount / 450))

  return (
    <main className="px-3 pt-4 pb-8 space-y-3">
      <Card className="p-4 space-y-3">
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[-0.11px] text-text-dim block">Slide Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Slide title"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] tracking-[-0.11px] text-text-dim block">Speaker Notes</label>
            <span className="text-[11px] tracking-[-0.11px] text-text-dim">
              {charCount} chars · ~{pageEstimate} glass page{pageEstimate !== 1 ? 's' : ''}
            </span>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Your speaker notes for this slide..."
            rows={12}
          />
          <p className="text-[11px] tracking-[-0.11px] text-text-muted">
            Notes are displayed on the G2 glasses during your presentation. ~450 characters fit per glass page.
          </p>
        </div>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={!title.trim()}>
        Save Slide
      </Button>
    </main>
  )
}
