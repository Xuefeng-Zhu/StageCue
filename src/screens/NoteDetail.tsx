import { useParams, useNavigate } from 'react-router'
import { Card, Badge, Button, EmptyState, useDrawerHeader } from 'even-toolkit/web'
import { IcEdit, IcTrash } from 'even-toolkit/web/icons/svg-icons'
import { useNotes } from '../contexts/NotesContext'

const CATEGORY_BADGE_VARIANT = {
  Personal: 'positive',
  Work: 'accent',
  Ideas: 'neutral',
} as const

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notes, deleteNote } = useNotes()

  const note = notes.find((n) => n.id === id)

  useDrawerHeader({
    title: note?.title ?? 'Note',
    backTo: '/',
    right: note ? (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/note/${note.id}/edit`)}>
          <IcEdit width={20} height={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            deleteNote(note.id)
            navigate('/')
          }}
        >
          <IcTrash width={20} height={20} />
        </Button>
      </div>
    ) : undefined,
  })

  if (!note) {
    return (
      <main className="px-3 pt-4 pb-8">
        <EmptyState
          title="Note not found"
          description="This note may have been deleted."
          action={{ label: 'Back to Notes', onClick: () => navigate('/') }}
        />
      </main>
    )
  }

  return (
    <main className="px-3 pt-4 pb-8 space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={CATEGORY_BADGE_VARIANT[note.category]}>{note.category}</Badge>
      </div>

      <Card className="p-4 space-y-3">
        <p className="text-[15px] tracking-[-0.15px] text-text whitespace-pre-wrap leading-relaxed">
          {note.content}
        </p>
      </Card>

      <Card className="p-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[-0.11px] text-text-dim">Created</span>
          <span className="text-[11px] tracking-[-0.11px] text-text">{formatDate(note.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[-0.11px] text-text-dim">Updated</span>
          <span className="text-[11px] tracking-[-0.11px] text-text">{formatDate(note.updatedAt)}</span>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => navigate(`/note/${note.id}/edit`)}>
          Edit Note
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          onClick={() => {
            deleteNote(note.id)
            navigate('/')
          }}
        >
          Delete
        </Button>
      </div>
    </main>
  )
}
