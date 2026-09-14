import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ToastHost } from './components/ui.jsx'
import { PositionProvider } from './lib/position.jsx'
import { useTheme } from './lib/theme.js'
import AppHeader from './components/AppHeader.jsx'
import Home from './pages/Home.jsx'
import PlaceDetail from './pages/PlaceDetail.jsx'
import PlaceMap from './pages/PlaceMap.jsx'
import Journey from './pages/Journey.jsx'

export default function App() {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  // The journey takes the whole viewport: its text sits over photographs of
  // the place, where a light register has no ground to stand on.
  const immersive = pathname.includes('/journey/')

  return (
    <PositionProvider>
      <ToastHost>
        <div
          data-theme={immersive ? 'dark' : theme}
          className="relative flex min-h-dvh flex-col text-white"
          style={{ background: 'var(--app-bg)' }}
        >
          {!immersive && <AppHeader />}

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/place/:placeId" element={<PlaceDetail />} />
              <Route path="/place/:placeId/map" element={<PlaceMap />} />
              <Route path="/place/:placeId/journey/:checkpointId" element={<Journey />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </ToastHost>
    </PositionProvider>
  )
}
