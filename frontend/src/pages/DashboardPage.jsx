import React from 'react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const metrics = [
    { title: 'Opportunity Score', value: '84/100', status: 'Exceptional', color: 'var(--success)' },
    { title: 'Founder-Market Fit', value: 'High', status: 'Solid Alignment', color: 'var(--accent-secondary)' },
    { title: 'Investment Score', value: '70/100', status: 'Fundable', color: 'var(--accent)' },
    { title: 'Buildability Score', text: '8/10', value: '8.2/10', status: 'Highly Feasible', color: 'var(--primary)' }
  ]

  const recentProjects = [
    { name: 'Edify', score: '84', status: 'In Validation', date: 'Just now' },
    { name: 'CurricuLabs AI', score: '80', status: 'Validated', date: '2 hours ago' },
    { name: 'AdaptaLearn', score: '72', status: 'In Discovery', date: '2 days ago' }
  ]

  const agentActivity = [
    { text: 'Discovery Agent generated 3 new opportunities for Edify', time: '5 mins ago', status: 'completed' },
    { text: 'Market Validation Agent analyzed 10 YC competitors for CurricuLabs AI', time: '2 hours ago', status: 'completed' },
    { text: 'MVP Planner Agent drafted database schema for AdaptaLearn', time: '2 days ago', status: 'completed' },
    { text: 'Pitch Deck Agent generated financial projections slide', time: '3 days ago', status: 'completed' }
  ]

  const latestStartups = [
    { name: 'Edify', desc: 'AI-powered content creation tool for teachers and students.', score: '84' },
    { name: 'CurricuLabs AI', desc: 'Automated lesson planning and assessment generator.', score: '80' }
  ]

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Top Header */}
      <div className="view-header">
        <div>
          <span className="view-pretitle">ACCELERATOR HUB</span>
          <h1 className="view-title">Founder Dashboard</h1>
        </div>
        <div className="view-actions">
          <Link to="/app/discovery" className="btn btn-primary">
            + New Startup Idea
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map((m) => (
          <div className="metric-card" key={m.title}>
            <div className="metric-header">
              <span className="metric-title">{m.title}</span>
              <span className="metric-status-dot" style={{ backgroundColor: m.color }}></span>
            </div>
            <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
            <div className="metric-status">{m.status}</div>
          </div>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="grid-col-2">
          {/* Recent Projects Card */}
          <div className="panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Recent Startup Projects</h2>
              <Link to="/app/projects" className="panel-link">View all</Link>
            </div>
            <div className="panel-body">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Startup Name</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((p) => (
                    <tr key={p.name}>
                      <td className="font-semibold">{p.name}</td>
                      <td>
                        <span className="badge-score">{p.score}</span>
                      </td>
                      <td>
                        <span className={`badge-status ${p.status.toLowerCase().replace(' ', '-')}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-muted">{p.date}</td>
                      <td>
                        <Link to="/app/validation" className="btn-table">Open</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Startups */}
          <div className="panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Latest Generated Startups</h2>
            </div>
            <div className="panel-body flex-col gap-4">
              {latestStartups.map((s) => (
                <div className="startup-card" key={s.name}>
                  <div className="startup-card-header">
                    <h3 className="startup-card-name">{s.name}</h3>
                    <span className="startup-card-score">{s.score} Score</span>
                  </div>
                  <p className="startup-card-desc">{s.desc}</p>
                  <div className="startup-card-actions">
                    <Link to="/app/validation" className="link-action">Market Validation ➔</Link>
                    <Link to="/app/mvp" className="link-action">MVP Roadmap ➔</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid-col-1">
          {/* Agent Activity Feed */}
          <div className="panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Agent Activity Feed</h2>
            </div>
            <div className="panel-body">
              <div className="activity-feed">
                {agentActivity.map((a, idx) => (
                  <div className="activity-item" key={idx}>
                    <div className="activity-icon-container">
                      <div className="activity-icon-pulse"></div>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">{a.text}</p>
                      <span className="activity-time">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
