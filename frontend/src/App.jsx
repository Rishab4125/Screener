import { Routes, Route } from 'react-router-dom'
import ScreenerPage from './pages/ScreenerPage'
import StockDetailPage from './pages/StockDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScreenerPage />} />
      <Route path="/stocks/:ticker" element={<StockDetailPage />} />
    </Routes>
  )
}
