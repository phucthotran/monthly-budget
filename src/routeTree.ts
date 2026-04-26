import { rootRoute } from './routes/__root'
import { budgetRoute } from './routes/budget'
import { incomeRoute } from './routes/income'
import { indexRoute } from './routes/index'
import { loginRoute } from './routes/login'
import { settingsRoute } from './routes/settings'
import { statsRoute } from './routes/stats'

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  budgetRoute,
  incomeRoute,
  statsRoute,
  settingsRoute,
])
