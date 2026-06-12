import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const steps = [
    { name: 'Founder Profile', desc: 'Define skills, budget & goals', active: true },
    { name: 'Discovery Agent', desc: 'Scan markets & YC databases', active: true },
    { name: 'Market Validation', desc: 'Competitor & demand analysis', active: true },
    { name: 'MVP Planner Agent', desc: 'Tech stack, databases & API specs', active: true },
    { name: 'Pitch Deck Agent', desc: 'Investor deck presentation', active: true },
    { name: 'Fundable Startup', desc: 'Launch & raise capital', active: true }
  ]

  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="brand-logo">SF</div>
          <span className="brand-name">StartupForge AI</span>
        </div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <Link to="/app/dashboard" className="btn btn-secondary">Sign In</Link>
          <Link to="/app/dashboard" className="btn btn-primary">Start Building</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">AI Startup Accelerator</span>
          <h1 className="hero-title">From Idea to Investor-Ready Startup</h1>
          <p className="hero-subtitle">
            StartupForge AI is your AI startup accelerator that discovers opportunities, validates markets, plans MVPs, and generates investor-ready pitch decks.
          </p>
          <div className="hero-actions">
            <Link to="/app/dashboard" className="btn btn-primary btn-lg">Start Building</Link>
            <button className="btn btn-secondary btn-lg btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div id="workflow" className="workflow-container">
          <h2 className="workflow-title">The Accelerator Pipeline</h2>
          <p className="workflow-subtitle">Five specialized AI agents cooperating to harden your business idea.</p>
          
          <div className="workflow-flow">
            {steps.map((step, idx) => (
              <React.Fragment key={step.name}>
                <div className="workflow-step-card">
                  <div className="step-number">{idx + 1}</div>
                  <h3 className="step-name">{step.name}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="workflow-connector">
                    <div className="connector-line"></div>
                    <div className="connector-pulse"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 StartupForge AI. Built for the next generation of founders.</p>
      </footer>
    </div>
  )
}
