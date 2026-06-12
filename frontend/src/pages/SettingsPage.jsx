import React, { useState } from 'react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('gsk_aLiW7F4c2UZkehFipdtHWGdyb3FY7f9h2m...')

  return (
    <div className="settings-view animate-fade-in">
      <div className="view-header">
        <div>
          <span className="view-pretitle">PREFERENCES</span>
          <h1 className="view-title">Settings</h1>
        </div>
      </div>

      <div className="settings-layout">
        <div className="panel-card mb-6">
          <div className="panel-header">
            <h2 className="panel-title">Founder Profile Settings</h2>
          </div>
          <div className="panel-body">
            <div className="form-grid">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue="Jai Surya" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" defaultValue="jai@startupforge.ai" />
                </div>
              </div>
              <div className="form-group">
                <label>Company / Team Name</label>
                <input type="text" defaultValue="StartupForge AI Co" />
              </div>
              <div>
                <button type="button" className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-card mb-6">
          <div className="panel-header">
            <h2 className="panel-title">Integration Credentials</h2>
          </div>
          <div className="panel-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Groq SDK API Key</label>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                />
                <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Used to generate startup opportunities, database designs, roadmap timelines, and slide pitch decks.
                </span>
              </div>
              <div className="form-group">
                <label>ChromaDB Server Address</label>
                <input type="text" defaultValue="./chroma_db (Local Persistent Client)" disabled />
              </div>
              <div>
                <button type="button" className="btn btn-primary">Update Credentials</button>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Billing & Plan</h2>
          </div>
          <div className="panel-body flex-row justify-between align-center">
            <div>
              <h3 className="font-semibold text-main">Pro Accelerator Plan</h3>
              <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
                $49/month • Renews automatically on July 12, 2026.
              </p>
            </div>
            <button className="btn btn-secondary">Manage Subscription</button>
          </div>
        </div>
      </div>
    </div>
  )
}
