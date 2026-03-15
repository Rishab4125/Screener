import { Link } from 'react-router-dom'

function formatReturn(value) {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export default function ScreenerTable({ rows, sortBy, onSort }) {
  const headers = [
    { key: 'name', label: 'Stock' },
    { key: '1y', label: '1Y Return' },
    { key: '3y', label: '3Y Return' },
    { key: '5y', label: '5Y Return' },
  ]

  return (
    <table className="screener-table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header.key} onClick={() => onSort(header.key)}>
              {header.label} {sortBy.key === header.key ? (sortBy.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.ticker}>
            <td>
              <Link to={`/stocks/${row.ticker}`} state={{ name: row.name }}>
                {row.name} <span className="ticker">({row.ticker})</span>
              </Link>
            </td>
            <td className={row.returns['1y'] == null ? '' : row.returns['1y'] > 0 ? 'positive' : 'negative'}>{formatReturn(row.returns['1y'])}</td>
            <td className={row.returns['3y'] == null ? '' : row.returns['3y'] > 0 ? 'positive' : 'negative'}>{formatReturn(row.returns['3y'])}</td>
            <td className={row.returns['5y'] == null ? '' : row.returns['5y'] > 0 ? 'positive' : 'negative'}>{formatReturn(row.returns['5y'])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
