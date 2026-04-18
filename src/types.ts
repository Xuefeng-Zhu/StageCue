export type NoteCategory = 'Personal' | 'Work' | 'Ideas'

export interface Note {
  id: string
  title: string
  content: string
  category: NoteCategory
  createdAt: number
  updatedAt: number
}

export const CATEGORIES: NoteCategory[] = ['Personal', 'Work', 'Ideas']
export const ALL_FILTER = 'All'
export type CategoryFilter = typeof ALL_FILTER | NoteCategory
