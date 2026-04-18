import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Input, Textarea, Select, Button, Card, useDrawerHeader } from 'even-toolkit/web'
import { useNotes } from '../contexts/NotesContext'
import { CATEGORIES, type NoteCategory } from '../types'

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }))

export function NoteForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notes, addNote, updateNote } = useNotes()

  const existing = id ? notes.find((n) => n.id === id) : undefined
  const isEdit = Boolean(existing)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [content, setContent] = useState(existing?.content ?? '')
  const [category, setCategory] = useState<NoteCategory>(existing?.category ?? 'Personal')

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setContent(existing.content)
      setCategory(existing.category)
    }
  }, [existing])

  useDrawerHeader({
    title: isEdit ? 'Edit Note' : 'New Note',
    backTo: isEdit && id ? `/note/${id}` : '/',
  })

  const canSave = title.trim().length > 0

  function handleSave() {
    if (!canSave) return
    if (isEdit && id) {
      updateNote(id, title.trim(), content.trim(), category)
      navigate(`/note/${id}`)
    } else {
      const note = addNote(title.trim(), content.trim(), category)
      navigate(`/note/${note.id}`)
    }
  }

  return (
    <main className="px-3 pt-4 pb-8 space-y-3">
      <Card className="p-4 space-y-3">
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[-0.11px] text-text-dim block">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[-0.11px] text-text-dim block">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            rows={8}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[-0.11px] text-text-dim block">Category</label>
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onValueChange={(v) => setCategory(v as NoteCategory)}
          />
        </div>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={!canSave}>
        {isEdit ? 'Save Changes' : 'Create Note'}
      </Button>
    </main>
  )
}
