import type { GlassScreen } from 'even-toolkit/glass-screen-router'
import { buildScrollableList } from 'even-toolkit/glass-display-builders'
import { moveHighlight } from 'even-toolkit/glass-nav'
import type { AppSnapshot, AppActions } from '../shared'

export const homeScreen: GlassScreen<AppSnapshot, AppActions> = {
  display(snapshot, nav) {
    return {
      lines: buildScrollableList({
        items: snapshot.items,
        highlightedIndex: nav.highlightedIndex,
        maxVisible: 5,
        formatter: (item) => item,
      }),
    }
  },

  action(action, nav, snapshot, ctx) {
    if (action.type === 'HIGHLIGHT_MOVE') {
      return { ...nav, highlightedIndex: moveHighlight(nav.highlightedIndex, action.direction, snapshot.items.length - 1) }
    }

    if (action.type === 'SELECT_HIGHLIGHTED') {
      const id = snapshot.itemIds[nav.highlightedIndex]
      if (id) {
        ctx?.startPresenting(id)
        ctx?.navigate(`/present/${id}`)
        return { ...nav, screen: 'presenter', highlightedIndex: 0 }
      }
    }

    return nav
  },
}
