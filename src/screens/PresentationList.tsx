import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { ListItem, Badge, EmptyState, Button, Input, Card, ScreenHeader, useDrawerHeader } from 'even-toolkit/web'
import { IcPlus } from 'even-toolkit/web/icons/svg-icons'
import { usePresentation } from '../contexts/PresentationContext'
import { parsePptx } from '../lib/pptx-parser'

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
  const { presentations, addPresentation, deletePresentation, importPresentation } = usePresentation()
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so the same file can be re-selected
    e.target.value = ''

    if (!file.name.toLowerCase().endsWith('.pptx')) {
      setImportError('Please select a .pptx file')
      return
    }

    setImporting(true)
    setImportError(null)

    try {
      const buffer = await file.arrayBuffer()
      const parsed = await parsePptx(buffer)

      const title = parsed.title || file.name.replace(/\.pptx$/i, '')
      const pres = importPresentation(title, parsed.slides)

      setImporting(false)
      navigate(`/presentation/${pres.id}`)
    } catch (err) {
      setImporting(false)
      setImportError(
        err instanceof Error ? err.message : 'Failed to parse PPTX file',
      )
    }
  }

  return (
    <main className="px-3 pt-4 pb-8 space-y-3">
      <ScreenHeader
        title="Presentations"
        subtitle={`${presentations.length} deck${presentations.length !== 1 ? 's' : ''}`}
      />

      {/* Import / Create actions */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          {importing ? 'Importing...' : '↑ Import PPTX'}
        </Button>
        <Button className="flex-1" onClick={() => setShowNew(true)}>
          + New Deck
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        className="hidden"
        onChange={handleFileSelect}
      />

      {importError && (
        <Card className="p-3 border border-negative/30">
          <p className="text-[13px] tracking-[-0.13px] text-negative">{importError}</p>
        </Card>
      )}

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
          description="Import a PPTX file or create a deck manually."
          action={{ label: 'Import PPTX', onClick: () => fileInputRef.current?.click() }}
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
