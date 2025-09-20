import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

const RootComponent = () => {
  const location = useLocation()

  // Routes that don't need header (like homepage and login)
  const routesWithoutHeader = ['/', '/login']
  const showHeader = !routesWithoutHeader.includes(location.pathname)

  return (
    <>
      {showHeader && <Header />}
      <Outlet />
      <TanstackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
