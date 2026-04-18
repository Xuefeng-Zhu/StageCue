import { useState } from 'react'
import { SettingsGroup, ListItem, Card, Button, Divider, useDrawerHeader } from 'even-toolkit/web'
import { usePresentation } from '../contexts/PresentationContext'

export function Settings() {
  const { presentations } = usePresentation()
  const [confirmClear, setConfirmClear] = useState(false)

  useDrawerHeader({ title: 'Settings', backTo: '/' })

  function handleExport() {
    const data = JSON.stringify(presentations, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stagecue-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    localStorage.removeItem('StageCue-presentations')
    window.location.reload()
  }

  const totalSlides = presentations.reduce((sum, p) => sum + p.slides.length, 0)

  return (
    <main className="px-3 pt-4 pb-8 space-y-6">
      <SettingsGroup label="Data">
        <Card className="divide-y divide-border">
          <ListItem
            title="Export Presentations"
            subtitle={`Export ${presentations.length} deck${presentations.length !== 1 ? 's' : ''} (${totalSlides} slides) as JSON`}
            onPress={handleExport}
          />
          <div>
            <ListItem
              title={confirmClear ? 'Tap again to confirm' : 'Clear All Data'}
              subtitle="Permanently delete all presentations"
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
            Presenter slide notes for Even Realities G2 smart glasses. See your speaker notes on the glasses while presenting. All data is stored locally in your browser.
          </p>
        </Card>
      </SettingsGroup>
    </main>
  )
}
