import { CssBaseline, ThemeProvider } from '@mui/material'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Outlet, RouterProvider, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { TimeEntryForm } from './components/TimeEntryForm'
import { TimeEntryList } from './components/TimeEntryList'
import theme from './theme'

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <main className="app-content">
          <Outlet />
        </main>
        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </ThemeProvider>
  ),
})

// Use TimeEntryList as the index/home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TimeEntryList,
})

// Time entries list route
const timeEntriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/time-entries',
  component: TimeEntryList,
})

// Create time entry route
const createTimeEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/time-entries/new',
  component: () => <TimeEntryForm mode="create" />,
})

// Edit time entry route
const editTimeEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/time-entries/$timeEntryId',
  component: function EditTimeEntry() {
    const { timeEntryId } = editTimeEntryRoute.useParams()
    return <TimeEntryForm mode="edit" timeEntryId={parseInt(timeEntryId)} />
  },
})

// Register routes
const routeTree = rootRoute.addChildren([indexRoute, timeEntriesRoute, createTimeEntryRoute, editTimeEntryRoute])

// Create router instance
const router = createRouter({ routeTree })

// Export type for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}
