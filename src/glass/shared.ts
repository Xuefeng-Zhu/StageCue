export interface AppSnapshot {
  // Presenting mode
  isPresenting: boolean
  slideTitle: string
  slideNotes: string
  slideIndex: number
  totalSlides: number
  notePage: number
  totalNotePages: number
  // Home mode (list of presentations)
  items: string[]
  flashPhase: boolean
}

export interface AppActions {
  navigate: (path: string) => void
  nextSlide: () => void
  prevSlide: () => void
  setNotePage: (page: number) => void
}
