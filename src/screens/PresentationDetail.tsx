import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Card, Badge, Button, Input, EmptyState, useDrawerHeader } from 'even-toolkit/web'
import { IcPlus, IcEdit, IcTrash } from 'even-toolkit/web/icons/svg-icons'
import { usePresentation } from '../contexts/PresentationContext'

export function PresentationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    presentations,
    deletePresentation,
    addSlide,
    deleteSlide,
    reorderSlides,
    startPresenting,
    updatePresentation,
  } = usePresentation()

  const pres = presentations.find((p) => p.id === id)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  useDrawerHeader({
    title: pres?.title ?? 'Presentation',
    backTo: '/',
    right: pres ? (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => { setTitleDraft(pres.title); setEditingTitle(true) }}>
          <IcEdit width={20} height={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { deletePresentation(pres.id); navigate('/') }}
        >
          <IcTrash width={20} height={20} />
        </Button>
      </div>
    ) : undefined,
  })

  if (!pres) {
    return (
      <main className="px-3 pt-4 pb-8">
        <EmptyState
          title="Presentation not found"
          description="This presentation may have been deleted."
          action={{ label: 'Back', onClick: () => navigate('/') }}
        />
      </main>
    )
  }

  function handleStartPresenting() {
    startPresenting(pres!.id)
    navigate(`/present/${pres!.id}`)
  }

  function handleAddSlide() {
    addSlide(pres!.id, `Slide ${pres!.slides.length + 1}`, '')
  }

  function handleSaveTitle() {
    if (titleDraft.trim()) {
      updatePresentation(pres!.id, titleDraft.trim())
    }
    setEditingTitle(false)
  }

  function handleMoveSlide(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= pres!.slides.length) return
    reorderSlides(pres!.id, index, target)
  }

  return (
    <main className="px-3 pt-4 pb-8 space-y-3">
      {editingTitle && (
        <Card className="p-4 space-y-3">
          <Input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            placeholder="Presentation title"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSaveTitle}>Save</Button>
            <Button variant="ghost" className="flex-1" onClick={() => setEditingTitle(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Button className="w-full" onClick={handleStartPresenting}>
        ▶ Start Presenting
      </Button>

      <div className="flex items-center justify-between">
        <p className="text-[13px] tracking-[-0.13px] text-text-dim">
          {pres.slides.length} slide{pres.slides.length !== 1 ? 's' : ''}
        </p>
        <Button variant="ghost" size="sm" onClick={handleAddSlide}>
          <span className="flex items-center gap-1">
            <IcPlus width={14} height={14} /> Add Slide
          </span>
        </Button>
      </div>

      <div className="space-y-2">
        {pres.slides.map((slide, index) => (
          <Card key={slide.id} className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="neutral">{index + 1}</Badge>
                <span className="text-[15px] tracking-[-0.15px] text-text font-medium">
                  {slide.title}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <Button variant="ghost" size="icon" onClick={() => handleMoveSlide(index, -1)}>
                    <span className="text-[13px]">↑</span>
                  </Button>
                )}
                {index < pres.slides.length - 1 && (
                  <Button variant="ghost" size="icon" onClick={() => handleMoveSlide(index, 1)}>
                    <span className="text-[13px]">↓</span>
                  </Button>
                )}
              </div>
            </div>
            {slide.notes && (
              <p className="text-[13px] tracking-[-0.13px] text-text-dim line-clamp-2">
                {slide.notes}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/presentation/${pres.id}/slide/${slide.id}`)}
              >
                Edit
              </Button>
              {pres.slides.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSlide(pres.id, slide.id)}
                >
                  <IcTrash width={14} height={14} />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
