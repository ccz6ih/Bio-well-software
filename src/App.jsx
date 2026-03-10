import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ScanPage from './pages/ScanPage.jsx'
import ChakraPage from './pages/ChakraPage.jsx'
import AuraPage from './pages/AuraPage.jsx'
import BiorhythmsPage from './pages/BiorhythmsPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import OrgansPage from './pages/OrgansPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import TrackerPage from './pages/TrackerPage.jsx'

const PAGES = {
  dashboard:   Dashboard,
  scan:        ScanPage,
  chakra:      ChakraPage,
  aura:        AuraPage,
  biorhythms:  BiorhythmsPage,
  organs:      OrgansPage,
  tracker:     TrackerPage,
  history:     HistoryPage,
  reports:     ReportPage,
  settings:    SettingsPage,
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [transitionKey, setTransitionKey] = useState(0)
  const Page = PAGES[activePage] || Dashboard

  const handleNav = (page) => {
    if (page === activePage) return
    setActivePage(page)
    setTransitionKey(k => k + 1)
  }

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bw-deep)' }}>
      <Sidebar active={activePage} onNav={handleNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar page={activePage} />
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div key={transitionKey} style={{ height: '100%', animation: 'page-enter 0.35s ease both' }}>
            <Page onNav={handleNav} />
          </div>
        </main>
      </div>
    </div>
  )
}
