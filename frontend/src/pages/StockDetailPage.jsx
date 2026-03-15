import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fetchStockHistory } from '../api'

export default function StockDetailPage() {
  const { ticker } = useParams()
  const location = useLocation()
  const [period, setPeriod] = useState('5y')
  const [adjusted, setAdjusted] = useState(false)
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetchStockHistory(ticker, period, adjusted)
      .then((data) => {
        if (!mounted) return
        setPrices(data.prices)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [ticker, period, adjusted])

  return (
    <main className="container">
      <Link to="/">← Back to screener</Link>
      <h1>{location.state?.name || ticker}</h1>
      <p>{ticker} price trend</p>

      <div className="filters">
        <label>
          Time range
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="1y">1 year</option>
            <option value="3y">3 years</option>
            <option value="5y">5 years</option>
            <option value="max">Max</option>
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={adjusted} onChange={(e) => setAdjusted(e.target.checked)} />
          Dividend adjusted prices
        </label>
      </div>

      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={prices}>
              <XAxis dataKey="date" minTickGap={35} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#2563eb" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  )
}
