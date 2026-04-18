import type { GlassScreen } from 'even-toolkit/glass-screen-router'
import { line, separator, glassHeader } from 'even-toolkit/types'
import { paginateText, pageIndicator } from 'even-toolkit/paginate-text'
import type { AppSnapshot, AppActions } from '../shared'

export const presenterScreen: GlassScreen<AppSnapshot, AppActions> = {
  display(snapshot) {
    const pages = paginateText(snapshot.slideNotes || '(no notes)')
    const page = Math.min(snapshot.notePage, pages.length - 1)
    const totalPages = pages.length

    // Header with slide number and title
    const headerText = `[${snapshot.slideIndex + 1}/${snapshot.totalSlides}] ${snapshot.slideTitle}`
    const lines = [...glassHeader(headerText)]

    // Page indicator for multi-page notes
    if (totalPages > 1) {
      lines.push(line(pageIndicator(page, totalPages), 'meta'))
    }

    // Note content lines
    const pageLines = pages[page]
    for (const noteLine of pageLines) {
      lines.push(line(noteLine))
    }

    // Bottom navigation hint
    lines.push(separator())
    lines.push(line('swipe: navigate slides', 'meta'))

    return { lines }
  },

  action(action, nav, snapshot, ctx) {
    const pages = paginateText(snapshot.slideNotes || '(no notes)')
    const currentPage = snapshot.notePage
    const totalPages = pages.length

    if (action.type === 'GO_BACK') {
      ctx?.stopPresenting()
      ctx?.navigate('/')
      return { ...nav, screen: 'home', highlightedIndex: 0 }
    }

    if (action.type === 'HIGHLIGHT_MOVE') {
      if (action.direction === 'down') {
        // Scroll down: next page of notes, or next slide
        if (currentPage < totalPages - 1) {
          ctx?.setNotePage(currentPage + 1)
        } else {
          ctx?.nextSlide()
          ctx?.setNotePage(0)
        }
      } else {
        // Scroll up: previous page of notes, or previous slide
        if (currentPage > 0) {
          ctx?.setNotePage(currentPage - 1)
        } else {
          ctx?.prevSlide()
        }
      }
      return nav
    }

    return nav
  },
}
