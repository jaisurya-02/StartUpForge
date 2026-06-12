import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Welcome to StartUpForge</div>} />
      </Routes>
    </Router>
  )
}

export default App
