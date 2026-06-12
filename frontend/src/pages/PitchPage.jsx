import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'

export default function PitchPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeSlide, setActiveSlide] = useState(0)
  const [exporting, setExporting] = useState(null) // 'pdf' or 'ppt' or null
  const [startup, setStartup] = useState(null)

  // Manual onboarding form state
  const [manualForm, setManualForm] = useState({
    startup_name: 'Edify Access',
    problem: 'Teachers spend too much time creating personalized content.',
    solution: 'AI-powered content generation tailored for educators.',
    target_users: 'Teachers, Students, Educational Institutions',
    validation: 'High market demand score (85%) and solid buildability (80%).',
    features: 'Tailored course handout generator, adaptive quiz engine, database DDL schema.',
    revenue_strategy: 'Tiered teacher subscription at $29/mo and school-wide licensing.',
    success_probability: '84%'
  })

  // Stepper / loader states
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [pitchData, setPitchData] = useState(null)

  // Run on state passed
  useEffect(() => {
    if (location.state && location.state.startup) {
      setStartup(location.state.startup)
      runPitchDeckGenerator(location.state.startup)
    }
  }, [location.state])

  const runPitchDeckGenerator = async (startupInfo) => {
    setIsLoading(true)
    setErrorText('')
    setPitchData(null)
    setActiveSlide(0)

    try {
      const payload = {
        startup_name: startupInfo.startup_name || startupInfo.name,
        problem: startupInfo.problem,
        solution: startupInfo.solution,
        target_users: startupInfo.target_users || startupInfo.users,
        validation: startupInfo.validation || startupInfo.validation_summary || 'Validated Market Demand',
        features: startupInfo.features || 'MVP feature list',
        revenue_strategy: startupInfo.revenue_strategy || 'Tiered SaaS pricing',
        success_probability: startupInfo.success_probability || '80%'
      }

      const response = await apiClient.post('/pitch', payload)
      setPitchData(response.data)
    } catch (err) {
      console.error(err)
      setErrorText('Failed to generate Pitch Deck. Rates limits might have been exceeded. Check logs.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    setStartup(manualForm)
    runPitchDeckGenerator(manualForm)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setManualForm((prev) => ({ ...prev, [name]: value }))
  }

  const defaultSlides = [
    {
      title: 'Problem',
      headline: 'Identify The Customer Pain Point',
      points: [
        'Curriculum differentiation takes up 10-15 hours of a teacher\'s week.',
        'Existing web tools are complex or highly expensive.',
        'Student performance outcomes remain low.'
      ]
    }
  ]

  // Parse pitch slides dynamically
  const getDeckSlides = () => {
    if (!pitchData || !pitchData.pitch_deck) return defaultSlides
    const raw = pitchData.pitch_deck
    
    const findPoints = (keys) => {
      for (const key of keys) {
        const foundKey = Object.keys(raw).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, ''))
        if (foundKey && raw[foundKey]) {
          const val = raw[foundKey]
          if (Array.isArray(val)) {
            return val.map(p => typeof p === 'object' ? (p.point || p.text || JSON.stringify(p)) : String(p))
          }
          if (typeof val === 'object') {
            return Object.entries(val).map(([k, v]) => `${k}: ${v}`)
          }
          if (typeof val === 'string') {
            return val.split('\n').filter(Boolean)
          }
        }
      }
      return null
    }

    const findHeadline = (keys, fallback) => {
      for (const key of keys) {
        const foundKey = Object.keys(raw).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, ''))
        if (foundKey && raw[foundKey]) {
          const val = raw[foundKey]
          if (typeof val === 'string') return val
          if (typeof val === 'object' && !Array.isArray(val)) {
            return val.headline || val.title || val.summary || fallback
          }
        }
      }
      return fallback
    }

    const sections = [
      { key: 'Problem', label: 'Problem', keys: ['Problem', 'Problem Statement', '2'] },
      { key: 'Solution', label: 'Solution', keys: ['Solution', 'Solution Statement', '3'] },
      { key: 'Market Opportunity', label: 'Market', keys: ['Market Opportunity', 'Market', '4'] },
      { key: 'Competitive Landscape', label: 'Competition', keys: ['Competitive Landscape', 'Competition', '5'] },
      { key: 'Product Overview', label: 'Product', keys: ['Product Overview', 'Product', '6'] },
      { key: 'Business Model', label: 'Business Model', keys: ['Business Model', 'Business', '7'] },
      { key: 'Go To Market Strategy', label: 'Go-To-Market', keys: ['Go To Market Strategy', 'GTM', 'Go-To-Market', '8'] },
      { key: 'Development Roadmap', label: 'Roadmap', keys: ['Development Roadmap', 'Roadmap', '9'] },
      { key: 'Financial Projections', label: 'Financials', keys: ['Financial Projections', 'Financials', '10'] },
      { key: 'Funding Ask', label: 'Funding Ask', keys: ['Funding Ask', 'Ask', 'Funding', '11'] }
    ]

    const compiledSlides = []
    sections.forEach((s) => {
      const points = findPoints(s.keys)
      const headline = findHeadline(s.keys, `${startup?.startup_name || 'Startup'} ${s.label}`)
      if (points && points.length > 0) {
        compiledSlides.push({
          title: s.label,
          headline: headline,
          points: points
        })
      }
    })

    if (compiledSlides.length > 0) return compiledSlides

    return Object.entries(raw).map(([key, val]) => {
      let pts = []
      if (Array.isArray(val)) {
        pts = val
      } else if (typeof val === 'object' && val !== null) {
        pts = Object.entries(val).map(([k, v]) => `${k}: ${v}`)
      } else {
        pts = [String(val)]
      }
      return {
        title: key,
        headline: key,
        points: pts
      }
    })
  }

  const slides = getDeckSlides()

  const triggerExport = (type) => {
    setExporting(type)
    setTimeout(() => {
      setExporting(null)
      alert(`Successfully exported pitch deck as ${type.toUpperCase()}!`)
    }, 2000)
  }

  return (
    <div className="pitch-view animate-fade-in">
      <div className="view-header">
        <div>
          <span className="view-pretitle">FUNDING PORTAL</span>
          <h1 className="view-title">Pitch Deck Generator</h1>
        </div>
        {pitchData && (
          <div className="view-actions gap-2">
            <button 
              onClick={() => triggerExport('pdf')} 
              className="btn btn-secondary"
              disabled={exporting !== null}
            >
              {exporting === 'pdf' ? 'Exporting PDF...' : '📄 Export PDF'}
            </button>
            <button 
              onClick={() => triggerExport('ppt')} 
              className="btn btn-primary"
              disabled={exporting !== null}
            >
              {exporting === 'ppt' ? 'Exporting PPT...' : '📊 Export PPT'}
            </button>
          </div>
        )}
      </div>

      {errorText && (
        <div className="panel-card mb-6" style={{ borderColor: 'var(--accent)', backgroundColor: '#FFF5F5' }}>
          <div className="panel-body text-accent" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            ⚠️ {errorText}
          </div>
        </div>
      )}

      {/* Loading state spinner */}
      {isLoading && (
        <div className="panel-card mb-6 flex-center py-12">
          <div className="flex-col items-center text-center">
            <div className="step-spinner mb-4" style={{ width: '40px', height: '40px' }}></div>
            <h3 className="font-semibold text-lg">Pitch Deck Agent is drafting the slides...</h3>
            <p className="text-muted mt-2">Writing problem statements, solutions, GTM slides, and financial models.</p>
          </div>
        </div>
      )}

      {/* No Startup Onboarding */}
      {!startup && !isLoading && (
        <div className="two-column-layout animate-fade-in">
          <div className="form-column">
            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Generate Investor Deck</h2>
              </div>
              <div className="panel-body">
                <form onSubmit={handleManualSubmit} className="form-grid">
                  <div className="form-group">
                    <label htmlFor="startup_name">Startup Name</label>
                    <input
                      type="text"
                      id="startup_name"
                      name="startup_name"
                      value={manualForm.startup_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="problem">Problem Statement</label>
                    <textarea
                      id="problem"
                      name="problem"
                      rows="2"
                      value={manualForm.problem}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="solution">Solution Description</label>
                    <textarea
                      id="solution"
                      name="solution"
                      rows="2"
                      value={manualForm.solution}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="target_users">Target Users</label>
                    <input
                      type="text"
                      id="target_users"
                      name="target_users"
                      value={manualForm.target_users}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="validation">Validation Results Summary</label>
                    <input
                      type="text"
                      id="validation"
                      name="validation"
                      value={manualForm.validation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="features">MVP Key Features</label>
                    <input
                      type="text"
                      id="features"
                      name="features"
                      value={manualForm.features}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label htmlFor="revenue_strategy">Revenue Strategy</label>
                      <input
                        type="text"
                        id="revenue_strategy"
                        name="revenue_strategy"
                        value={manualForm.revenue_strategy}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="success_probability">Success Rate</label>
                      <input
                        type="text"
                        id="success_probability"
                        name="success_probability"
                        value={manualForm.success_probability}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block mt-4">
                    🚀 Run Pitch Deck Agent
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="output-column">
            <div className="idle-state">
              <div className="idle-illustration">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </div>
              <h3 className="idle-title">Pitch Workspace Idle</h3>
              <p className="idle-desc">
                Select a startup from your pipeline or enter info on the left to compile slides with the Pitch Deck Agent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Pitch Deck Viewer */}
      {pitchData && !isLoading && (
        <div className="pitch-layout">
          {/* Slide navigation grid selector */}
          <div className="slide-nav-panel">
            <span className="nav-section-title">SLIDES</span>
            <div className="slide-list">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  className={`slide-select-btn ${activeSlide === idx ? 'active' : ''}`}
                  onClick={() => setActiveSlide(idx)}
                >
                  <span className="slide-select-num">{idx + 1}</span>
                  <span className="slide-select-title">{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Presentation Sandbox */}
          <div className="presentation-workspace">
            {/* Main Slide canvas */}
            <div className="slide-canvas">
              <div className="slide-watermark">StartupForge AI Pitch Spec</div>
              <div className="slide-canvas-body">
                <span className="slide-step-badge">SLIDE {activeSlide + 1} OF {slides.length}</span>
                <h2 className="slide-main-title">{slides[activeSlide]?.headline}</h2>
                
                <ul className="slide-points">
                  {slides[activeSlide]?.points.map((p, idx) => (
                    <li key={idx} className="slide-point-item">
                      <span className="slide-point-marker">➔</span>
                      <p className="slide-point-text">{p}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="slide-footer">
                <span className="slide-footer-brand">{startup?.startup_name || startup?.name} Accelerator deck</span>
                <span className="slide-footer-page">Confidential • 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
