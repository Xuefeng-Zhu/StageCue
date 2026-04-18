import { useState } from 'react'
import { SettingsGroup, Toggle, ListItem, Card, Button, Divider, useDrawerHeader } from 'even-toolkit/web'
import { useNotes } from '../contexts/NotesContext'

export function Settings() {
  const { notes, compactView, setCompactView } = useNotes()
  const [confirmClear, setConfirmClear] = useState(false)

  useDrawerHeader({ title: 'Settings', backTo: '/' })

  function handleExport() {
    const data = JSON.stringify(notes, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    localStorage.removeItem('StageCue-notes')
    window.location.reload()
  }

  return (
    <main className="px-3 pt-4 pb-8 space-y-6">
      <SettingsGroup label="Display">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] tracking-[-0.15px] text-text">Compact View</p>
              <p className="text-[11px] tracking-[-0.11px] text-text-dim mt-0.5">
                Hide note previews in the list
              </p>
            </div>
            <Toggle checked={compactView} onChange={setCompactView} />
          </div>
        </Card>
      </SettingsGroup>

      <SettingsGroup label="Data">
        <Card className="divide-y divide-border">
          <ListItem
            title="Export Notes"
            subtitle={`Export all ${notes.length} notes as JSON`}
            onPress={handleExport}
          />
          <div>
            <ListItem
              title={confirmClear ? 'Tap again to confirm' : 'Clear All Notes'}
              subtitle="Permanently delete all notes"
              onPress={handleClearAll}
            />
            {confirmClear && (
              <div className="px-4 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </SettingsGroup>

      <SettingsGroup label="About">
        <Card className="p-4 space-y-1.5">
          <p className="text-[15px] tracking-[-0.15px] text-text">StageCue</p>
          <p className="text-[13px] tracking-[-0.13px] text-text-dim">Version 1.0.0</p>
          <Divider className="my-2" />
          <p className="text-[11px] tracking-[-0.11px] text-text-dim">
            A notes app for Even Realities G2 smart glasses. All data is stored locally in your browser.
          </p>
        </Card>
      </SettingsGroup>
    </main>
  )
}
