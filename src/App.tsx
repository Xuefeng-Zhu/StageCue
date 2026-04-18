import { Routes, Route } from 'react-router'
import { Shell } from './layouts/shell'
import { PresentationProvider } from './contexts/PresentationContext'
import { PresentationList } from './screens/PresentationList'
import { PresentationDetail } from './screens/PresentationDetail'
import { SlideEditor } from './screens/SlideEditor'
import { PresenterView } from './screens/PresenterView'
import { Settings } from './screens/Settings'
import { AppGlasses } from './glass/AppGlasses'

export function App() {
  return (
    <PresentationProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<PresentationList />} />
          <Route path="/presentation/:id" element={<PresentationDetail />} />
          <Route path="/presentation/:id/slide/:slideId" element={<SlideEditor />} />
          <Route path="/present/:id" element={<PresenterView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <AppGlasses />
    </PresentationProvider>
  )
}
