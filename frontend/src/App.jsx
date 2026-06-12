import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/common/Sidebar'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import DiscoveryPage from './pages/DiscoveryPage'
import ValidationPage from './pages/ValidationPage'
import MvpPage from './pages/MvpPage'
import PitchPage from './pages/PitchPage'
import ProjectsPage from './pages/ProjectsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Marketing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Workspace App Shell */}
        <Route
          path="/app/*"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="discovery" element={<DiscoveryPage />} />
                  <Route path="validation" element={<ValidationPage />} />
                  <Route path="mvp" element={<MvpPage />} />
                  <Route path="pitch" element={<PitchPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </main>
            </div>
          }
        />
        
        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
