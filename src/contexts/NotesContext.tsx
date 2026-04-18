import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Note, NoteCategory, CategoryFilter } from '../types'
import { ALL_FILTER } from '../types'

interface NotesContextValue {
  notes: Note[]
  addNote: (title: string, content: string, category: NoteCategory) => Note
  updateNote: (id: string, title: string, content: string, category: NoteCategory) => void
  deleteNote: (id: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: CategoryFilter
  setSelectedCategory: (c: CategoryFilter) => void
  filteredNotes: Note[]
  compactView: boolean
  setCompactView: (v: boolean) => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

const STORAGE_KEY = 'StageCue-notes'
const SETTINGS_KEY = 'StageCue-settings'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const SAMPLE_NOTES: Note[] = [
  {
    id: 'sample-1',
    title: 'Meeting Notes',
    content: 'Discussed Q2 roadmap with the team. Key decisions:\n\n- Launch new dashboard by end of April\n- Prioritize mobile experience improvements\n- Schedule design review for next Wednesday\n- Allocate two sprints for performance optimization',
    category: 'Work',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'sample-2',
    title: 'Recipe Ideas',
    content: 'Try making sourdough bread this weekend. Need to get a starter going by Thursday at the latest.\n\nIngredients to pick up:\n- Bread flour (King Arthur)\n- Sea salt\n- Dutch oven if I can find one on sale',
    category: 'Personal',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'sample-3',
    title: 'App Feature',
    content: 'What if we added voice-to-text note creation using the G2 glasses microphone? Could use the even-toolkit STT module with web-speech provider for real-time transcription.\n\nWould need:\n- Mic permission handling\n- Visual feedback on glasses display\n- Auto-punctuation',
    category: 'Ideas',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
]

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return SAMPLE_NOTES
}

function loadSettings(): { compactView: boolean } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { compactView: false }
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(ALL_FILTER)
  const [compactView, setCompactView] = useState(() => loadSettings().compactView)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ compactView }))
  }, [compactView])

  const addNote = useCallback((title: string, content: string, category: NoteCategory): Note => {
    const now = Date.now()
    const note: Note = { id: generateId(), title, content, category, createdAt: now, updatedAt: now }
    setNotes((prev) => [note, ...prev])
    return note
  }, [])

  const updateNote = useCallback((id: string, title: string, content: string, category: NoteCategory) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title, content, category, updatedAt: Date.now() } : n)),
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === ALL_FILTER || note.category === selectedCategory
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  return (
    <NotesContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        deleteNote,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filteredNotes,
        compactView,
        setCompactView,
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used within NotesProvider')
  return ctx
}
