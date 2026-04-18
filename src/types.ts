export interface Slide {
  id: string
  title: string
  notes: string
}

export interface Presentation {
  id: string
  title: string
  slides: Slide[]
  createdAt: number
  updatedAt: number
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
