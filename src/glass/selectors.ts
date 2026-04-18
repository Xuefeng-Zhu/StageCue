import { createGlassScreenRouter } from 'even-toolkit/glass-screen-router'
import type { AppSnapshot, AppActions } from './shared'
import { homeScreen } from './screens/home'
import { presenterScreen } from './screens/presenter'

export type { AppSnapshot, AppActions }

export const { toDisplayData, onGlassAction } = createGlassScreenRouter<AppSnapshot, AppActions>({
  'home': homeScreen,
  'presenter': presenterScreen,
}, 'home')
