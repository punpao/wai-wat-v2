import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastHost } from './components/ui.jsx'
import { useTheme } from './lib/theme.js'
import DeviceFrame from './components/DeviceFrame.jsx'
import AppHeader from './components/AppHeader.jsx'
import Home from './pages/Home.jsx'
import PlaceDetail from './pages/PlaceDetail.jsx'
import PlaceMap from './pages/PlaceMap.jsx'
import Journey from './pages/Journey.jsx'

export default function App() {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  // The journey takes the whole handset: its text sits over photographs of
  // the place, where a light register has no ground to stand on.
  const immersive = pathname.includes('/journey/')

  return (
    <ToastHost>
      <DeviceFrame data-theme={immersive ? 'dark' : theme}>
        <div className="device-scroll text-white" style={{ background: 'var(--app-bg)' }}>
          {!immersive && <AppHeader />}

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/place/:placeId" element={<PlaceDetail />} />
              <Route path="/place/:placeId/map" element={<PlaceMap />} />
              <Route path="/place/:placeId/journey/:checkpointId" element={<Journey />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </DeviceFrame>
    </ToastHost>
  )
}
