import { Routes, Route } from 'react-router'
import { Shell } from './layouts/shell'
import { NotesProvider } from './contexts/NotesContext'
import { NoteList } from './screens/NoteList'
import { NoteDetail } from './screens/NoteDetail'
import { NoteForm } from './screens/NoteForm'
import { Settings } from './screens/Settings'
import { AppGlasses } from './glass/AppGlasses'

export function App() {
  return (
    <NotesProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<NoteList />} />
          <Route path="/note/:id" element={<NoteDetail />} />
          <Route path="/new" element={<NoteForm />} />
          <Route path="/note/:id/edit" element={<NoteForm />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <AppGlasses />
    </NotesProvider>
  )
}
