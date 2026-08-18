import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ToastHost } from './components/ui.jsx'
import { PositionProvider } from './lib/position.jsx'
import { useStore } from './lib/useStore.js'
import { storage } from './lib/storage.js'
import { useIsElder } from './lib/role.js'
import AppHeader from './components/AppHeader.jsx'
import BottomNav from './components/BottomNav.jsx'
import DemoPanel from './components/DemoPanel.jsx'
import MapJourney from './pages/user/MapJourney.jsx'
import ARScan from './pages/user/ARScan.jsx'
import Profile from './pages/user/Profile.jsx'
import ElderHome from './pages/elder/ElderHome.jsx'
import MyClips from './pages/elder/MyClips.jsx'
import Redeem from './pages/elder/Redeem.jsx'

export default function App() {
  const state = useStore()
  const { pathname } = useLocation()
  const isElder = useIsElder()
  // AR takes the whole viewport — no chrome over the camera feed.
  const immersive = pathname.startsWith('/scan')

  // Keep the stored role truthful when the route was reached by URL.
  useEffect(() => {
    const role = isElder ? 'elder' : 'user'
    if (state.role !== role) storage.setRole(role)
  }, [isElder, state.role])

  return (
    <PositionProvider>
      <ToastHost>
        <div
          className={`relative flex min-h-dvh flex-col ${
            isElder ? 'elder-scope bg-paper text-maroon900' : 'text-white'
          }`}
          style={isElder ? undefined : { background: 'var(--gradient-hero)' }}
        >
          {!immersive && <AppHeader />}

          <main className={`flex-1 ${immersive ? '' : 'pb-28'}`}>
            <Routes>
              <Route path="/" element={<Navigate to={state.role === 'elder' ? '/elder' : '/map'} replace />} />
              <Route path="/map" element={<MapJourney />} />
              <Route path="/scan/:checkpointId" element={<ARScan />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/elder" element={<ElderHome />} />
              <Route path="/elder/clips" element={<MyClips />} />
              <Route path="/elder/redeem" element={<Redeem />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {!immersive && <BottomNav />}
          {!isElder && !immersive && <DemoPanel />}
        </div>
      </ToastHost>
    </PositionProvider>
  )
}
