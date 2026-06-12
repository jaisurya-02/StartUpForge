import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProjectsPage() {
  const navigate = useNavigate()

  const projects = [
    { name: 'Edify', score: '84', status: 'In Validation', date: 'June 12, 2026', desc: 'AI-powered educational content creation tool for teachers and students.' },
    { name: 'CurricuLabs AI', score: '80', status: 'Validated', date: 'June 10, 2026', desc: 'Automated lesson planning and worksheet assessment generator.' },
    { name: 'AdaptaLearn', score: '72', status: 'In Discovery', date: 'June 09, 2026', desc: 'Personalized adaptive course paths for school students.' }
  ]

  return (
    <div className="projects-view animate-fade-in">
      <div className="view-header">
        <div>
          <span className="view-pretitle">REPOSITORY</span>
          <h1 className="view-title">My Projects</h1>
        </div>
        <div className="view-actions">
          <button onClick={() => navigate('/app/discovery')} className="btn btn-primary">
            + Start New Idea
          </button>
        </div>
      </div>

      <div className="projects-grid-container">
        {projects.map((p) => (
          <div className="project-repository-card" key={p.name}>
            <div className="proj-card-header">
              <h3 className="proj-name">{p.name}</h3>
              <span className={`badge-status ${p.status.toLowerCase().replace(' ', '-')}`}>
                {p.status}
              </span>
            </div>
            <p className="proj-desc">{p.desc}</p>
            <div className="proj-meta-row">
              <div className="proj-meta-item">
                <span className="proj-meta-label">Overall Score</span>
                <span className="proj-meta-value text-success">{p.score}</span>
              </div>
              <div className="proj-meta-item">
                <span className="proj-meta-label">Created</span>
                <span className="proj-meta-value">{p.date}</span>
              </div>
            </div>
            <div className="proj-card-actions">
              <button onClick={() => navigate('/app/dashboard')} className="btn btn-secondary btn-sm">
                Open Workspace
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
