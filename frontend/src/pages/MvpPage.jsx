import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'

export default function MvpPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('features')
  const [startup, setStartup] = useState(null)

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    startup_name: 'Edify Access',
    problem: 'Teachers spend too much time creating personalized content.',
    solution: 'AI-powered content generation tailored for educators.',
    target_users: 'Teachers, Students, Educational Institutions',
    skills: 'Python, React, Machine Learning',
    experience: 'Student',
    budget: 'Low'
  })

  // Stepper / Loader States
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [errorText, setErrorText] = useState('')
  const [mvpData, setMvpData] = useState(null)

  const steps = [
    'Deconstructing MVP scope',
    'Selecting architecture components',
    'Generating database schema',
    'Designing API specification',
    'Building release roadmap'
  ]

  // Run on state passed
  useEffect(() => {
    if (location.state && location.state.startup) {
      setStartup(location.state.startup)
      runMvpPlanner(location.state.startup)
    }
  }, [location.state])

  // Stepper visual ticker
  useEffect(() => {
    let timer
    if (isLoading && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 2500)
    }
    return () => clearTimeout(timer)
  }, [isLoading, currentStep])

  const runMvpPlanner = async (startupInfo) => {
    setIsLoading(true)
    setCurrentStep(0)
    setErrorText('')
    setMvpData(null)

    try {
      const payload = {
        startup_name: startupInfo.startup_name || startupInfo.name,
        problem: startupInfo.problem,
        solution: startupInfo.solution,
        target_users: startupInfo.target_users || startupInfo.users,
        skills: startupInfo.skills || 'Python, React',
        experience: startupInfo.experience || 'Student',
        budget: startupInfo.budget || 'Low'
      }

      const response = await apiClient.post('/mvp', payload)
      setMvpData(response.data)
      setCurrentStep(steps.length - 1)
    } catch (err) {
      console.error(err)
      setErrorText('Failed to generate MVP blueprint. Rate limits might have hit. Check backend logs.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    setStartup(manualForm)
    runMvpPlanner(manualForm)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setManualForm((prev) => ({ ...prev, [name]: value }))
  }

  // Helpers to parse response fields dynamically
  const getFeaturesList = () => {
    if (!mvpData || !mvpData.features) return []
    const raw = mvpData.features
    const list = []
    
    const mvpFeatures = raw['MVP Features'] || raw['mvp_features'] || raw['MVP'] || raw['Core MVP'] || []
    const premiumFeatures = raw['Premium Features'] || raw['premium_features'] || raw['Premium'] || []
    
    if (Array.isArray(mvpFeatures)) {
      mvpFeatures.forEach(f => {
        list.push({
          title: typeof f === 'object' ? (f.title || f.name || f.feature) : f,
          desc: typeof f === 'object' ? (f.description || f.desc) : 'Core MVP features for initial release.',
          type: 'Core MVP'
        })
      })
    } else if (typeof mvpFeatures === 'object') {
      Object.entries(mvpFeatures).forEach(([key, val]) => {
        list.push({ title: key, desc: String(val), type: 'Core MVP' })
      })
    }
    
    if (Array.isArray(premiumFeatures)) {
      premiumFeatures.forEach(f => {
        list.push({
          title: typeof f === 'object' ? (f.title || f.name || f.feature) : f,
          desc: typeof f === 'object' ? (f.description || f.desc) : 'Premium features planned for next releases.',
          type: 'Premium'
        })
      })
    } else if (typeof premiumFeatures === 'object') {
      Object.entries(premiumFeatures).forEach(([key, val]) => {
        list.push({ title: key, desc: String(val), type: 'Premium' })
      })
    }
    
    if (list.length > 0) return list
    
    return Object.entries(raw).map(([key, val]) => ({
      title: key,
      desc: typeof val === 'object' ? JSON.stringify(val) : String(val),
      type: 'Core MVP'
    }))
  }

  const getTechStack = () => {
    if (!mvpData || !mvpData.tech_stack) return []
    const raw = mvpData.tech_stack
    if (Array.isArray(raw)) {
      return raw.map(t => ({
        type: t.type || t.category || 'Technology',
        name: t.name || t.tool || 'Service',
        desc: t.desc || t.description || t.reason || '',
        color: 'var(--accent)'
      }))
    }
    if (typeof raw === 'object') {
      const colors = ['var(--accent)', 'var(--accent-secondary)', 'var(--primary)', 'var(--success)', 'var(--text-muted)']
      return Object.entries(raw).map(([key, val], idx) => {
        let name = ''
        let desc = ''
        if (typeof val === 'object' && val !== null) {
          name = val.name || val.tool || val.choice || ''
          desc = val.desc || val.description || val.reason || ''
        } else {
          name = String(val)
          desc = 'Recommended architecture component.'
        }
        return {
          type: key,
          name: name,
          desc: desc,
          color: colors[idx % colors.length]
        }
      })
    }
    return []
  }

  const getDatabaseSchema = () => {
    if (!mvpData || !mvpData.database) return 'No database schema generated.'
    const raw = mvpData.database
    if (typeof raw === 'string') return raw
    if (raw.sql || raw.SQL) return raw.sql || raw.SQL
    if (raw.schema) return typeof raw.schema === 'object' ? JSON.stringify(raw.schema, null, 2) : String(raw.schema)
    return JSON.stringify(raw, null, 2)
  }

  const getApiEndpoints = () => {
    if (!mvpData || !mvpData.apis) return []
    const raw = mvpData.apis
    if (Array.isArray(raw)) {
      return raw.map(api => ({
        method: api.method || api.HTTP_method || 'GET',
        path: api.path || api.route || api.url || '/',
        desc: api.desc || api.description || 'API endpoint.'
      }))
    }
    if (typeof raw === 'object') {
      const endpoints = raw.endpoints || raw.apis || raw
      if (Array.isArray(endpoints)) {
        return getApiEndpoints(endpoints)
      }
      return Object.entries(endpoints).map(([key, val]) => {
        const parts = key.split(' ')
        const method = parts.length > 1 ? parts[0] : 'GET'
        const path = parts.length > 1 ? parts[1] : key
        return {
          method: method,
          path: path,
          desc: typeof val === 'object' ? (val.desc || val.description || JSON.stringify(val)) : String(val)
        }
      })
    }
    return []
  }

  const getTimeline = () => {
    if (!mvpData || !mvpData.roadmap) return []
    const raw = mvpData.roadmap
    if (Array.isArray(raw)) {
      return raw.map((t, idx) => ({
        week: t.week || t.time || `Week ${idx + 1}`,
        title: t.title || t.phase || 'Development Phase',
        desc: t.desc || t.description || t.goals || '',
        progress: t.progress !== undefined ? parseInt(t.progress) : Math.max(0, 100 - idx * 30)
      }))
    }
    if (typeof raw === 'object') {
      const list = raw.weeks || raw.phases || raw
      if (Array.isArray(list)) {
        return list.map((t, idx) => ({
          week: t.week || t.time || `Week ${idx + 1}`,
          title: t.title || t.phase || 'Development Phase',
          desc: t.desc || t.description || t.goals || '',
          progress: t.progress !== undefined ? parseInt(t.progress) : Math.max(0, 100 - idx * 30)
        }))
      }
      return Object.entries(list).map(([key, val], idx) => {
        let title = ''
        let desc = ''
        if (typeof val === 'object' && val !== null) {
          title = val.title || val.phase || key
          desc = val.desc || val.description || val.goals || ''
        } else {
          title = key
          desc = String(val)
        }
        return {
          week: key.startsWith('Week') ? key : `Week ${idx + 1}`,
          title: title,
          desc: desc,
          progress: Math.max(0, 100 - idx * 30)
        }
      })
    }
    return []
  }

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

  // Nav to Pitch page
  const handleGeneratePitch = () => {
    navigate('/app/pitch', {
      state: {
        startup: {
          ...startup,
          validation: startup.validation_summary || "Validated Market Demand & Buildability",
          features: JSON.stringify(mvpData.features),
          revenue_strategy: JSON.stringify(mvpData.revenue_strategy || {}),
          success_probability: String(getScore(mvpData.success_probability, ["Success Probability", "success_probability", "score"], 80))
        }
      }
    })
  }

  // Data bindings
  const features = getFeaturesList()
  const techStack = getTechStack()
  const sqlSchema = getDatabaseSchema()
  const apiEndpoints = getApiEndpoints()
  const timeline = getTimeline()

  return (
    <div className="mvp-view animate-fade-in">
      <div className="view-header">
        <div>
          <span className="view-pretitle">DEVELOPMENT WORKSPACE</span>
          <h1 className="view-title">MVP Planner</h1>
        </div>
        {mvpData && (
          <div className="view-actions">
            <button onClick={handleGeneratePitch} className="btn btn-primary">
              📊 Generate Pitch Deck ➔
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

      {/* Stepper Loader */}
      {isLoading && (
        <div className="panel-card mb-6">
          <div className="panel-header">
            <h2 className="panel-title">MVP Architect Agent Engine</h2>
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

      {/* No Startup Onboarding */}
      {!startup && !isLoading && (
        <div className="two-column-layout">
          <div className="form-column">
            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Plan Startup MVP</h2>
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
                  <div className="form-group-row">
                    <div className="form-group">
                      <label htmlFor="skills">Skills</label>
                      <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={manualForm.skills}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="experience">Experience</label>
                      <select
                        id="experience"
                        name="experience"
                        value={manualForm.experience}
                        onChange={handleInputChange}
                      >
                        <option value="Student">Student</option>
                        <option value="Professional">Professional</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="budget">Budget</label>
                    <select id="budget" name="budget" value={manualForm.budget} onChange={handleInputChange}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block mt-4">
                    🚀 Run MVP Planner Agent
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="output-column">
            <div className="idle-state">
              <div className="idle-illustration">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 className="idle-title">MVP Workspace Idle</h3>
              <p className="idle-desc">
                Select a startup idea from the Discovery/Validation pages, or enter details on the left to start planning the MVP architecture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main MVP Details */}
      {mvpData && !isLoading && (
        <div className="mvp-layout">
          {/* Left Nav Pane */}
          <div className="mvp-sidebar-menu">
            <button 
              className={`mvp-menu-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              📋 Recommended Features
            </button>
            <button 
              className={`mvp-menu-btn ${activeTab === 'tech' ? 'active' : ''}`}
              onClick={() => setActiveTab('tech')}
            >
              💻 Tech Stack Architecture
            </button>
            <button 
              className={`mvp-menu-btn ${activeTab === 'db' ? 'active' : ''}`}
              onClick={() => setActiveTab('db')}
            >
              🗄️ Database Design
            </button>
            <button 
              className={`mvp-menu-btn ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              🔌 API Architecture
            </button>
            <button 
              className={`mvp-menu-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              📅 Development Timeline
            </button>
          </div>

          {/* Right Details Pane */}
          <div className="mvp-details-pane">
            {activeTab === 'features' && (
              <div className="panel-card">
                <div className="panel-header">
                  <h2 className="panel-title">MVP Feature Backlog</h2>
                </div>
                <div className="panel-body flex-col gap-4">
                  {features.length === 0 ? (
                    <p className="text-muted">No features generated.</p>
                  ) : (
                    features.map((f, idx) => (
                      <div className="feature-item-row" key={idx}>
                        <div className="feature-item-main">
                          <div className="feature-item-title-row">
                            <span className="feature-item-dot"></span>
                            <h4 className="feature-item-title">{f.title}</h4>
                          </div>
                          <p className="feature-item-desc">{f.desc}</p>
                        </div>
                        <span className={`feature-type-tag ${f.type.toLowerCase().replace(' ', '-')}`}>
                          {f.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tech' && (
              <div className="tech-stack-panel animate-fade-in">
                <div className="section-heading mb-4">Architecture blueprint</div>
                {techStack.length === 0 ? (
                  <p className="text-muted">No tech stack specified.</p>
                ) : (
                  <div className="tech-stack-grid">
                    {techStack.map((t, idx) => (
                      <div className="tech-card" key={idx}>
                        <span className="tech-card-type">{t.type}</span>
                        <h3 className="tech-card-name" style={{ color: t.color }}>{t.name}</h3>
                        <p className="tech-card-desc">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="panel-card mt-6">
                  <div className="panel-header">
                    <h2 className="panel-title">Infrastructure optimizations</h2>
                  </div>
                  <div className="panel-body">
                    <ul className="info-bullets">
                      <li>**AWS Serverless Hosting**: High availability at low standby cost.</li>
                      <li>**Docker containerized build**: Easy deploy mapping for future scaling.</li>
                      <li>**Open-Source focus**: Avoid expensive enterprise databases or subscriptions.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'db' && (
              <div className="db-design-panel animate-fade-in">
                <div className="panel-card mb-6">
                  <div className="panel-header">
                    <h2 className="panel-title">Relational Schema (SQL)</h2>
                  </div>
                  <div className="panel-body font-mono-editor" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{sqlSchema}</pre>
                  </div>
                </div>

                <div className="panel-card">
                  <div className="panel-header">
                    <h2 className="panel-title">Relational Entity Map</h2>
                  </div>
                  <div className="panel-body flex-center">
                    <div className="entity-flow-map">
                      <div className="entity-node">
                        <span className="entity-tag">TABLE</span>
                        <h4>Startup</h4>
                        <hr />
                        <span className="entity-field">id (PK)</span>
                        <span className="entity-field">startup_name</span>
                        <span className="entity-field">problem</span>
                      </div>
                      <div className="entity-connector">➔</div>
                      <div className="entity-node">
                        <span className="entity-tag">TABLE</span>
                        <h4>Features</h4>
                        <hr />
                        <span className="entity-field">id (PK)</span>
                        <span className="entity-field">mvp_features</span>
                        <span className="entity-field">premium_features</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="panel-card animate-fade-in">
                <div className="panel-header">
                  <h2 className="panel-title">REST API spec endpoints</h2>
                </div>
                <div className="panel-body" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  {apiEndpoints.length === 0 ? (
                    <p className="text-muted">No endpoints generated.</p>
                  ) : (
                    <div className="api-list">
                      {apiEndpoints.map((api, idx) => (
                        <div className="api-endpoint-row" key={idx}>
                          <span className={`api-method method-${api.method.toLowerCase()}`}>
                            {api.method}
                          </span>
                          <span className="api-path font-mono-editor">{api.path}</span>
                          <span className="api-desc text-muted">{api.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="panel-card animate-fade-in">
                <div className="panel-header">
                  <h2 className="panel-title">Gantt roadmap timeline</h2>
                </div>
                <div className="panel-body">
                  {timeline.length === 0 ? (
                    <p className="text-muted">No timeline phases generated.</p>
                  ) : (
                    <div className="gantt-timeline">
                      {timeline.map((t, idx) => (
                        <div className="gantt-row" key={idx}>
                          <div className="gantt-header-col">
                            <span className="gantt-week">{t.week}</span>
                            <h4 className="gantt-title">{t.title}</h4>
                          </div>
                          <div className="gantt-bar-col">
                            <div className="gantt-track">
                              <div className="gantt-fill" style={{ width: `${t.progress}%` }}></div>
                              <span className="gantt-percent">{t.progress}%</span>
                            </div>
                            <p className="gantt-desc">{t.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
