import { useEffect, useMemo, useState } from 'react'
import { fetchScreenerData } from '../api'
import ScreenerTable from '../components/ScreenerTable'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function ScreenerPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [date, setDate] = useState(today())
  const [adjusted, setAdjusted] = useState(false)
  const [sortBy, setSortBy] = useState({ key: 'name', direction: 'asc' })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchScreenerData(date, adjusted)
      .then((data) => {
        if (!mounted) return
        setRows(data.data)
        setError('')
      })
      .catch(() => mounted && setError('Failed to load screener data.'))
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [date, adjusted])

  const sortedRows = useMemo(() => {
    const cloned = [...rows]
    cloned.sort((a, b) => {
      const { key, direction } = sortBy
      const factor = direction === 'asc' ? 1 : -1
      if (key === 'name') {
        return a.name.localeCompare(b.name) * factor
      }
      const aValue = a.returns[key] ?? Number.NEGATIVE_INFINITY
      const bValue = b.returns[key] ?? Number.NEGATIVE_INFINITY
      return (aValue - bValue) * factor
    })
    return cloned
  }, [rows, sortBy])

  const handleSort = (key) => {
    setSortBy((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'desc' }
    })
  }

  return (
    <main className="container">
      <h1>Nifty 50 Return Screener</h1>
      <p>Pick an “as of” date, toggle dividend-adjusted return, and sort by 1Y/3Y/5Y performance.</p>

      <div className="filters">
        <label>
          As of date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={adjusted} onChange={(e) => setAdjusted(e.target.checked)} />
          Show adjusted return (includes dividend effect)
        </label>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && <ScreenerTable rows={sortedRows} sortBy={sortBy} onSort={handleSort} />}
    </main>
  )
}
