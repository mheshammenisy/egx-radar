import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import RadarPage from './pages/RadarPage.jsx'
import StockDetailPage from './pages/StockDetailPage.jsx'
import './App.css'
import './production.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/radar" element={<RadarPage />} />
        <Route path="/stocks/:symbol" element={<StockDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
