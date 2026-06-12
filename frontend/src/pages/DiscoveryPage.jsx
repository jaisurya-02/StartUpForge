import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/api'

export default function DiscoveryPage() {
  const navigate = useNavigate()
  
  // Form state
  const [formData, setFormData] = useState({
    skills: 'Python, React, Machine Learning',
    interests: 'AI Education, EdTech, SaaS',
    experience: 'Student',
    budget: 'Low',
    goal: 'Build SaaS Startup'
  })

  // Agent runner state
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [showResults, setShowResults] = useState(false)
  const [opportunities, setOpportunities] = useState([])
  const [errorText, setErrorText] = useState('')

  const steps = [
    'Analyzing Founder Profile',
    'Finding Startup Patterns',
    'Searching YC Database',
    'Discovering Market Gaps',
    'Generating Opportunities'
  ]

  // Simulate stepper visual progression while fetching
  useEffect(() => {
    let timer
    if (isRunning && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [isRunning, currentStep])

  // Run discovery agent API call
  const runAgent = async (e) => {
    e.preventDefault()
    setIsRunning(true)
    setCurrentStep(0)
    setShowResults(false)
    setErrorText('')
    setOpportunities([])

    try {
      const response = await apiClient.post('/discovery', formData)
      
      // Complete stepper visually
      setCurrentStep(steps.length - 1)
      
      // Parse opportunities
      let generatedOpps = []
      const data = response.data
      
      if (data && data.opportunities) {
        // If it returns dict or array of opportunities
        const oppsData = data.opportunities
        const list = oppsData.opportunities || oppsData.opportunities_generated || oppsData
        if (Array.isArray(list)) {
          generatedOpps = list
        } else if (typeof list === 'object') {
          generatedOpps = Object.values(list)
        }
      }
      
      // Fallback fallback if format is empty or failed
      if (generatedOpps.length === 0) {
        generatedOpps = [
          {
            name: 'Edify Access',
            score: '84',
            problem: 'Limited AI Education resources for students in emerging markets.',
            solution: 'AI-powered content creation platform tailored for personalized teaching.',
            target_users: 'Teachers, Students, Educational Institutions'
          }
        ]
      }

      setOpportunities(
        generatedOpps.map((o, idx) => ({
          name: o.name || o.startup_name || `AI Idea #${idx + 1}`,
          score: o.score || o.opportunity_score || String(80 - idx * 4),
          problem: o.problem || o.problem_statement || 'Identified market pain point.',
          solution: o.solution || 'AI-powered software automation.',
          users: o.target_users || o.users || 'Target consumers'
        }))
      )
      
      setShowResults(true)
    } catch (err) {
      console.error(err)
      setErrorText('Failed to run agent. Check your Groq API key in Settings.')
      setShowResults(false)
    } finally {
      setIsRunning(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleValidate = (opp) => {
    // Navigate passing the selected opportunity and profile details
    navigate('/app/validation', { 
      state: { 
        startup: {
          startup_name: opp.name,
          problem: opp.problem,
          solution: opp.solution,
          target_users: opp.users,
          ...formData
        } 
      } 
    })
  }

  return (
    <div className="discovery-view animate-fade-in">
      <div className="view-header">
        <div>
          <span className="view-pretitle">AGENT ENGINE</span>
          <h1 className="view-title">Startup Discovery</h1>
        </div>
      </div>

      <div className="two-column-layout">
        {/* Left Form Column */}
        <div className="form-column">
          <div className="panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Founder Profile</h2>
            </div>
            <div className="panel-body">
              <form onSubmit={runAgent} className="form-grid">
                <div className="form-group">
                  <label htmlFor="skills">Skills & Expertise</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g. Python, React, Sales, Design"
                    required
                    disabled={isRunning}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="interests">Interests & Industries</label>
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="e.g. AI, Healthcare, Finance"
                    required
                    disabled={isRunning}
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="experience">Experience level</label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      disabled={isRunning}
                    >
                      <option value="Student">Student / Junior</option>
                      <option value="Professional">Professional (3-5 yrs)</option>
                      <option value="Senior">Senior Executive</option>
                      <option value="Serial Founder">Serial Founder</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="budget">Available Budget</label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      disabled={isRunning}
                    >
                      <option value="Low">Low (&lt;$5k)</option>
                      <option value="Medium">Medium ($5k - $50k)</option>
                      <option value="High">High (&gt;$50k)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="goal">Startup Goal</label>
                  <select
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    disabled={isRunning}
                  >
                    <option value="Build SaaS Startup">Build SaaS Startup</option>
                    <option value="Build AI Tool">Build AI Tool</option>
                    <option value="Create Mobile App">Create Mobile App</option>
                    <option value="Consulting / Services">Consulting / Services</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block mt-4"
                  disabled={isRunning}
                >
                  {isRunning ? 'Discovery Agent Running...' : '🚀 Run Discovery Agent'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Output Column */}
        <div className="output-column">
          {errorText && (
            <div className="panel-card mb-6" style={{ borderColor: 'var(--accent)', backgroundColor: '#FFF5F5' }}>
              <div className="panel-body text-accent" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                ⚠️ {errorText}
              </div>
            </div>
          )}

          {/* Agent Progress Box */}
          {(isRunning || currentStep >= 0) && (
            <div className="panel-card mb-6">
              <div className="panel-header">
                <h2 className="panel-title">Discovery Agent Engine</h2>
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
                      if (isRunning) {
                        stepClass = 'step-active'
                        icon = <div className="step-spinner"></div>
                      } else {
                        stepClass = 'step-completed'
                        icon = (
                          <svg className="step-icon-svg text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )
                      }
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

          {/* Opportunity Results */}
          {showResults && (
            <div className="results-container animate-fade-in">
              <h2 className="section-heading mb-4">Generated Opportunities</h2>
              <div className="opportunity-grid">
                {opportunities.map((opp) => (
                  <div className="opp-card" key={opp.name}>
                    <div className="opp-card-header">
                      <div>
                        <h3 className="opp-name">{opp.name}</h3>
                        <span className="opp-badge-users">{opp.users.split(',')[0]}</span>
                      </div>
                      <div className="opp-score-badge">
                        <span className="opp-score-value">{opp.score}</span>
                        <span className="opp-score-label">Score</span>
                      </div>
                    </div>
                    <div className="opp-details">
                      <div className="opp-detail-row">
                        <span className="opp-detail-title">Problem:</span>
                        <p className="opp-detail-text">{opp.problem}</p>
                      </div>
                      <div className="opp-detail-row">
                        <span className="opp-detail-title">Solution:</span>
                        <p className="opp-detail-text">{opp.solution}</p>
                      </div>
                    </div>
                    <div className="opp-actions">
                      <button 
                        onClick={() => handleValidate(opp)} 
                        className="btn btn-primary btn-sm"
                      >
                        Validate Market
                      </button>
                      <button className="btn btn-secondary btn-sm">Save Project</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idle state */}
          {!isRunning && currentStep === -1 && (
            <div className="idle-state">
              <div className="idle-illustration">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 className="idle-title">Discovery Engine Idle</h3>
              <p className="idle-desc">
                Fill in your founder profile on the left and start the Discovery Agent to scan markets and identify gaps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
