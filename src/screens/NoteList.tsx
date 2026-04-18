import { useNavigate } from 'react-router'
import { SearchBar, CategoryFilter, ListItem, Badge, EmptyState, Button, ScreenHeader, useDrawerHeader } from 'even-toolkit/web'
import { IcPlus, IcFeatQuickNote } from 'even-toolkit/web/icons/svg-icons'
import { useNotes } from '../contexts/NotesContext'
import { ALL_FILTER, CATEGORIES, type CategoryFilter as CategoryFilterType } from '../types'

const FILTER_OPTIONS = [ALL_FILTER, ...CATEGORIES]

const CATEGORY_BADGE_VARIANT = {
  Personal: 'positive',
  Work: 'accent',
  Ideas: 'neutral',
} as const

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

export function NoteList() {
  const navigate = useNavigate()
  const {
    filteredNotes,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    deleteNote,
    compactView,
  } = useNotes()

  useDrawerHeader({
    right: (
      <Button variant="ghost" size="icon" onClick={() => navigate('/new')}>
        <IcPlus width={20} height={20} />
      </Button>
    ),
  })

  return (
    <main className="px-3 pt-4 pb-8 space-y-3">
      <ScreenHeader
        title="Notes"
        subtitle={`${filteredNotes.length} note${filteredNotes.length !== 1 ? 's' : ''}`}
      />

      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search notes..."
      />

      <CategoryFilter
        categories={FILTER_OPTIONS}
        selected={selectedCategory}
        onSelect={(c) => setSelectedCategory(c as CategoryFilterType)}
      />

      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={<IcFeatQuickNote width={48} height={48} />}
          title={searchQuery || selectedCategory !== ALL_FILTER ? 'No matching notes' : 'No notes yet'}
          description={
            searchQuery || selectedCategory !== ALL_FILTER
              ? 'Try adjusting your search or category filter.'
              : 'Tap the + button to create your first note.'
          }
          action={
            !searchQuery && selectedCategory === ALL_FILTER
              ? { label: 'New Note', onClick: () => navigate('/new') }
              : undefined
          }
        />
      ) : (
        <div className="rounded-[6px] overflow-hidden divide-y divide-border">
          {filteredNotes.map((note) => (
            <ListItem
              key={note.id}
              title={note.title}
              subtitle={
                compactView
                  ? undefined
                  : note.content.split('\n')[0].slice(0, 80) + (note.content.length > 80 ? '...' : '')
              }
              trailing={
                <div className="flex items-center gap-2">
                  <Badge variant={CATEGORY_BADGE_VARIANT[note.category]}>{note.category}</Badge>
                  <span className="text-[11px] tracking-[-0.11px] text-text-dim whitespace-nowrap">
                    {formatRelativeTime(note.updatedAt)}
                  </span>
                </div>
              }
              onPress={() => navigate(`/note/${note.id}`)}
              onDelete={() => deleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
