import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RadarPage from './pages/RadarPage.jsx'
import StockDetailPage from './pages/StockDetailPage.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RadarPage />} />
        <Route path="/stocks/:symbol" element={<StockDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
