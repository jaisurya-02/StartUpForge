import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'

export default function ValidationPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Input states
  const [startup, setStartup] = useState(null)
  
  // Form state for manual input fallback
  const [manualForm, setManualForm] = useState({
    startup_name: 'Edify Access',
    problem: 'Teachers spend too much time creating personalized content.',
    solution: 'AI-powered content generation tailored for educators.',
    target_users: 'Teachers, Students, Educational Institutions',
    skills: 'Python, React, Machine Learning',
    experience: 'Student',
    budget: 'Low',
    goal: 'Build SaaS Startup'
  })

  // Stepper/loading states
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [errorText, setErrorText] = useState('')
  const [validationData, setValidationData] = useState(null)
  const [scoreOffset, setScoreOffset] = useState(440)

  const steps = [
    'Analyzing founder alignment',
    'Crawling YC startup datasets',
    'Analyzing market competition',
    'Assessing demand & pain points',
    'Drafting investment committee memo'
  ]

  // Initialize and run if state is passed
  useEffect(() => {
    if (location.state && location.state.startup) {
      setStartup(location.state.startup)
      runValidation(location.state.startup)
    }
  }, [location.state])

  // Stepper visual animation
  useEffect(() => {
    let timer
    if (isLoading && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 2000)
    }
    return () => clearTimeout(timer)
  }, [isLoading, currentStep])

  // Animate dial when score is loaded
  useEffect(() => {
    if (validationData) {
      const overallScore = getScore(validationData.validation, ["Opportunity Score", "opportunity_score", "Overall Score", "overall_score"], 80)
      const timer = setTimeout(() => {
        // Circle circumference is 2 * pi * r = 2 * 3.14159 * 70 = ~440
        // Offset = 440 * (1 - Score / 100)
        const offset = 440 * (1 - overallScore / 100)
        setScoreOffset(offset)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [validationData])

  const runValidation = async (startupInfo) => {
    setIsLoading(true)
    setCurrentStep(0)
    setErrorText('')
    setValidationData(null)
    setScoreOffset(440)

    try {
      const payload = {
        startup_name: startupInfo.startup_name || startupInfo.name,
        problem: startupInfo.problem,
        solution: startupInfo.solution,
        target_users: startupInfo.target_users || startupInfo.users,
        skills: startupInfo.skills || 'Python, React',
        experience: startupInfo.experience || 'Student',
        budget: startupInfo.budget || 'Low',
        goal: startupInfo.goal || 'Build SaaS Startup'
      }

      const response = await apiClient.post('/validation', payload)
      setValidationData(response.data)
      setCurrentStep(steps.length - 1)
    } catch (err) {
      console.error(err)
      setErrorText('Failed to run market validation. Check backend logs or API keys.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    setStartup(manualForm)
    runValidation(manualForm)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setManualForm((prev) => ({ ...prev, [name]: value }))
  }

  // Helpers to safely extract score from backend response keys
  const getScore = (obj, keys, fallback = 80) => {
    if (!obj) return fallback
    for (const key of keys) {
      if (obj[key] !== undefined) {
        const parsed = parseInt(obj[key])
        if (!isNaN(parsed)) return parsed
      }
    }
    return fallback
  }

  // Helpers to parse competitor objects
  const parseCompetitors = (rawCompetitors) => {
    if (!rawCompetitors) return []
    if (Array.isArray(rawCompetitors)) {
      return rawCompetitors.map(c => ({
        name: c.name || c.startup_name || 'Competitor',
        strengths: c.strengths || c.strength || 'N/A',
        weaknesses: c.weaknesses || c.weakness || 'N/A',
        gaps: c.gaps || c.gap || 'N/A'
      }))
    }
    if (typeof rawCompetitors === 'object') {
      // Check if there is a main array inside
      const list = rawCompetitors.competitors || rawCompetitors.direct_competitors || rawCompetitors.indirect_competitors
      if (Array.isArray(list)) {
        return parseCompetitors(list)
      }

      // If it is structured as keys with values
      const parsedList = []
      const direct = rawCompetitors['Direct Competitors'] || rawCompetitors['direct_competitors'] || []
      const indirect = rawCompetitors['Indirect Competitors'] || rawCompetitors['indirect_competitors'] || []
      const strengths = rawCompetitors['Competitor Strengths'] || rawCompetitors['competitor_strengths'] || ''
      const weaknesses = rawCompetitors['Competitor Weaknesses'] || rawCompetitors['competitor_weaknesses'] || ''
      const gaps = rawCompetitors['Market Gaps'] || rawCompetitors['market_gaps'] || ''

      const processNames = (arr) => {
        if (Array.isArray(arr)) {
          arr.forEach((item) => {
            if (typeof item === 'object') {
              parsedList.push({
                name: item.name || item.startup_name || 'Competitor',
                strengths: item.strengths || item.strength || strengths,
                weaknesses: item.weaknesses || item.weakness || weaknesses,
                gaps: item.gaps || item.gap || gaps
              })
            } else {
              parsedList.push({
                name: String(item),
                strengths,
                weaknesses,
                gaps
              })
            }
          })
        }
      }

      processNames(direct)
      processNames(indirect)
      if (parsedList.length > 0) return parsedList
    }

    return []
  }

  // Helper to parse investor feedback memo structure
  const parseInvestorFeedback = (raw) => {
    if (!raw) return null
    if (typeof raw === 'object') return raw
    let cleaned = raw.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim()
    }
    try {
      return JSON.parse(cleaned)
    } catch (e) {
      return { rawText: raw }
    }
  }

  // Retrieve scores
  const valObj = validationData?.validation || {}
  const overallScore = getScore(valObj, ["Opportunity Score", "opportunity_score", "Overall Score", "overall_score"], 80)
  const founderFit = getScore(valObj, ["Founder-Market Fit Score", "founder_market_fit_score", "Founder-Market Fit", "founder_fit_score"], 70)
  const demandScore = getScore(valObj, ["Market Demand Score", "market_demand_score", "Market Demand", "demand_score"], 85)
  const competitionScore = getScore(valObj, ["Competition Score", "competition_score", "Competition Level", "competition"], 60)
  const buildabilityScore = getScore(valObj, ["Buildability Score", "buildability_score", "Buildability"], 80)
  const scalabilityScore = getScore(valObj, ["Scalability Score", "scalability_score", "Scalability"], 65)

  // Radar chart points computation
  const r1 = Math.max(10, Math.min(100, founderFit))
  const r2 = Math.max(10, Math.min(100, demandScore))
  const r3 = Math.max(10, Math.min(100, competitionScore))
  const r4 = Math.max(10, Math.min(100, buildabilityScore))
  const r5 = Math.max(10, Math.min(100, scalabilityScore))
  const p1 = `150,${Math.round(150 - r1)}`
  const p2 = `${Math.round(150 + 0.95 * r2)},${Math.round(150 - 0.31 * r2)}`
  const p3 = `${Math.round(150 + 0.59 * r3)},${Math.round(150 + 0.81 * r3)}`
  const p4 = `${Math.round(150 - 0.59 * r4)},${Math.round(150 + 0.81 * r4)}`
  const p5 = `${Math.round(150 - 0.95 * r5)},${Math.round(150 - 0.31 * r5)}`
  const radarPolygonPoints = `${p1} ${p2} ${p3} ${p4} ${p5}`

  // Parse competitors & memo
  const competitorsList = parseCompetitors(validationData?.competitors)
  const investorFeedback = parseInvestorFeedback(validationData?.investor_feedback)

  const handlePlanMvp = () => {
    navigate('/app/mvp', {
      state: {
        startup: {
          ...startup,
          validation_summary: valObj["Validation Summary"] || valObj["validation_summary"] || "Market validation completed successfully."
        }
      }
    })
  }

  return (
    <div className="validation-view animate-fade-in">
      <div className="view-header">
        <div>
          <span className="view-pretitle">MARKET DYNAMICS</span>
          <h1 className="view-title">Market Validation</h1>
        </div>
        {validationData && (
          <div className="view-actions">
            <button onClick={handlePlanMvp} className="btn btn-primary">
              📋 Plan MVP ➔
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {errorText && (
        <div className="panel-card mb-6" style={{ borderColor: 'var(--accent)', backgroundColor: '#FFF5F5' }}>
          <div className="panel-body text-accent" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            ⚠️ {errorText}
          </div>
        </div>
      )}

      {/* Loading Stepper */}
      {isLoading && (
        <div className="panel-card mb-6">
          <div className="panel-header">
            <h2 className="panel-title">Market Validation Agent Engine</h2>
          </div>
          <div className="panel-body">
            <div className="agent-stepper">
              {steps.map((step, idx) => {
                let stepClass = 'step-pending'
                let icon = (
                  <svg className="step-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )
                
                if (idx < currentStep) {
                  stepClass = 'step-completed'
                  icon = (
                    <svg className="step-icon-svg text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )
                } else if (idx === currentStep) {
                  stepClass = 'step-active'
                  icon = <div className="step-spinner"></div>
                }

                return (
                  <div className={`agent-step ${stepClass}`} key={idx}>
                    <div className="step-icon-container">{icon}</div>
                    <span className="step-label">{step}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Manual Input Onboarding / Fallback */}
      {!startup && !isLoading && (
        <div className="two-column-layout">
          <div className="form-column">
            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Validate Startup Idea</h2>
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
                      rows="3"
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
                      rows="3"
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
                  <button type="submit" className="btn btn-primary btn-block mt-4">
                    🚀 Run Validation Agent
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="output-column">
            <div className="idle-state">
              <div className="idle-illustration">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="idle-title">Validation Engine Idle</h3>
              <p className="idle-desc">
                Select a startup idea from the Discovery page, or enter one manually on the left to start the validation agents.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Validation View Output */}
      {validationData && !isLoading && (
        <>
          <div className="scores-header-block mb-6">
            {/* Radial Dial */}
            <div className="radial-score-container">
              <div className="radial-score-svg-wrapper">
                <svg width="180" height="180" viewBox="0 0 180 180" className="radial-svg">
                  <circle cx="90" cy="90" r="70" className="radial-bg-circle" />
                  <circle 
                    cx="90" 
                    cy="90" 
                    r="70" 
                    className="radial-active-circle" 
                    style={{ strokeDashoffset: scoreOffset }}
                  />
                </svg>
                <div className="radial-score-content">
                  <span className="radial-number">{overallScore}</span>
                  <span className="radial-label">Overall Score</span>
                </div>
              </div>
              <div className="score-summary-text">
                <h3>{startup?.startup_name || startup?.name} Validation Report</h3>
                <p>
                  {valObj["Validation Summary"] || valObj["validation_summary"] || "Market analysis suggests strong core indicators."}
                </p>
              </div>
            </div>

            {/* Detailed Bar Scores */}
            <div className="bar-scores-card">
              <h3 className="card-subheading mb-4">Core Dimensions</h3>
              <div className="bar-scores-list">
                <div className="bar-score-item">
                  <div className="bar-score-info">
                    <span>Founder-Market Fit</span>
                    <span className="font-semibold">{founderFit}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${founderFit}%`, backgroundColor: 'var(--accent-secondary)' }}></div></div>
                </div>
                <div className="bar-score-item">
                  <div className="bar-score-info">
                    <span>Market Demand</span>
                    <span className="font-semibold">{demandScore}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${demandScore}%`, backgroundColor: 'var(--accent)' }}></div></div>
                </div>
                <div className="bar-score-item">
                  <div className="bar-score-info">
                    <span>Competition Level</span>
                    <span className="font-semibold">{competitionScore}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${competitionScore}%`, backgroundColor: 'var(--primary)' }}></div></div>
                </div>
                <div className="bar-score-item">
                  <div className="bar-score-info">
                    <span>Buildability</span>
                    <span className="font-semibold">{buildabilityScore}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${buildabilityScore}%`, backgroundColor: 'var(--success)' }}></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="validation-main-grid mb-6">
            {/* Radar Chart */}
            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Validation Radar Chart</h2>
              </div>
              <div className="panel-body flex-center">
                <div className="radar-chart-container">
                  <svg width="300" height="300" viewBox="0 0 300 300" className="radar-svg">
                    {/* Radar outer bounds web */}
                    <polygon points="150,50 245,119 209,231 91,231 55,119" className="radar-web-ring ring-1" />
                    <polygon points="150,80 221,131 194,210 106,210 79,131" className="radar-web-ring ring-2" />
                    <polygon points="150,110 197,144 179,190 121,190 103,144" className="radar-web-ring ring-3" />
                    
                    {/* Axes lines */}
                    <line x1="150" y1="150" x2="150" y2="50" className="radar-axis-line" />
                    <line x1="150" y1="150" x2="245" y2="119" className="radar-axis-line" />
                    <line x1="150" y1="150" x2="209" y2="231" className="radar-axis-line" />
                    <line x1="150" y1="150" x2="91" y2="231" className="radar-axis-line" />
                    <line x1="150" y1="150" x2="55" y2="119" className="radar-axis-line" />
                    
                    {/* Target data polygon */}
                    <polygon points={radarPolygonPoints} className="radar-data-polygon" />

                    {/* Labels */}
                    <text x="150" y="38" textAnchor="middle" className="radar-label-text">Founder-Market Fit</text>
                    <text x="255" y="118" textAnchor="start" className="radar-label-text">Demand</text>
                    <text x="219" y="248" textAnchor="start" className="radar-label-text">Competition</text>
                    <text x="81" y="248" textAnchor="end" className="radar-label-text">Buildability</text>
                    <text x="45" y="118" textAnchor="end" className="radar-label-text">Scalability</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Competitors List */}
            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Competitor Analysis</h2>
              </div>
              <div className="panel-body flex-col gap-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {competitorsList.length === 0 ? (
                  <p className="text-muted text-center py-8">No direct competitors found in local vector index.</p>
                ) : (
                  competitorsList.map((c, idx) => (
                    <div className="competitor-card" key={idx}>
                      <div className="comp-card-title-row">
                        <h3 className="comp-name">{c.name}</h3>
                        <span className="badge-comp-status">Direct Competitor</span>
                      </div>
                      <div className="comp-meta-grid">
                        <div>
                          <span className="comp-meta-label">Strengths</span>
                          <p className="comp-meta-text">{c.strengths}</p>
                        </div>
                        <div>
                          <span className="comp-meta-label">Weaknesses</span>
                          <p className="comp-meta-text">{c.weaknesses}</p>
                        </div>
                      </div>
                      <div className="comp-gap-box">
                        <span className="comp-meta-label text-accent">Market Gap Identified</span>
                        <p className="comp-meta-text font-medium">{c.gaps}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* YC Memo block */}
          <div className="panel-card bg-memo-cream">
            <div className="panel-header bg-transparent border-bottom-dashed">
              <div className="memo-logo-header">
                <div className="yc-orange-logo">YC</div>
                <h2 className="panel-title font-serif">Y Combinator Partner Review Memo</h2>
              </div>
              <span className="memo-date">Batch: Summer 2026</span>
            </div>
            <div className="panel-body font-serif-body">
              <div className="memo-field-row">
                <span className="memo-label">TO:</span>
                <span className="memo-value">YC Investment Committee</span>
              </div>
              <div className="memo-field-row">
                <span className="memo-label">FROM:</span>
                <span className="memo-value">Paul Graham & PG AI Agent Partner</span>
              </div>
              <div className="memo-field-row">
                <span className="memo-label">RECOMMENDATION:</span>
                <span className="memo-value text-success font-bold">
                  {investorFeedback?.recommendation || investorFeedback?.['Investment Recommendation'] || investorFeedback?.['recommendation'] || 'Invest (with conditions)'}
                </span>
              </div>
              
              <div className="memo-content-box mt-4">
                <h4 className="memo-section-heading">Overview</h4>
                <p>
                  {investorFeedback?.rawText || (
                    <>
                      <strong>Strengths: </strong>
                      {typeof investorFeedback?.Strengths === 'object' ? JSON.stringify(investorFeedback.Strengths) : (investorFeedback?.Strengths || 'Strong product differentiation.')}
                      <br /><br />
                      <strong>Weaknesses & Risks: </strong>
                      {typeof investorFeedback?.Weaknesses === 'object' ? JSON.stringify(investorFeedback.Weaknesses) : (investorFeedback?.Weaknesses || investorFeedback?.Risks || 'High initial execution hurdles.')}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
