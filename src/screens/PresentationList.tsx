import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ListItem, Badge, EmptyState, Button, Input, Card, ScreenHeader, useDrawerHeader } from 'even-toolkit/web'
import { IcPlus } from 'even-toolkit/web/icons/svg-icons'
import { usePresentation } from '../contexts/PresentationContext'

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function PresentationList() {
  const navigate = useNavigate()
  const { presentations, addPresentation, deletePresentation } = usePresentation()
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useDrawerHeader({
    right: (
      <Button variant="ghost" size="icon" onClick={() => setShowNew(true)}>
        <IcPlus width={20} height={20} />
      </Button>
    ),
  })

  function handleCreate() {
    if (!newTitle.trim()) return
    const pres = addPresentation(newTitle.trim())
    setNewTitle('')
    setShowNew(false)
    navigate(`/presentation/${pres.id}`)
  }

  return (
    <main className="px-3 pt-4 pb-8 space-y-3">
      <ScreenHeader
        title="Presentations"
        subtitle={`${presentations.length} deck${presentations.length !== 1 ? 's' : ''}`}
      />

      {showNew && (
        <Card className="p-4 space-y-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Presentation title"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleCreate} disabled={!newTitle.trim()}>
              Create
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => { setShowNew(false); setNewTitle('') }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {presentations.length === 0 ? (
        <EmptyState
          title="No presentations yet"
          description="Create a presentation to get started with your slide notes."
          action={{ label: 'New Presentation', onClick: () => setShowNew(true) }}
        />
      ) : (
        <div className="rounded-[6px] overflow-hidden divide-y divide-border">
          {presentations.map((pres) => (
            <ListItem
              key={pres.id}
              title={pres.title}
              subtitle={`${pres.slides.length} slide${pres.slides.length !== 1 ? 's' : ''}`}
              trailing={
                <div className="flex items-center gap-2">
                  <Badge variant="accent">{pres.slides.length}</Badge>
                  <span className="text-[11px] tracking-[-0.11px] text-text-dim whitespace-nowrap">
                    {formatRelativeTime(pres.updatedAt)}
                  </span>
                </div>
              }
              onPress={() => navigate(`/presentation/${pres.id}`)}
              onDelete={() => deletePresentation(pres.id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
