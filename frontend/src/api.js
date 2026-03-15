import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

export async function fetchScreenerData(date, adjusted) {
  const response = await api.get('/screener', {
    params: { date, adjusted },
  })
  return response.data
}

export async function fetchStockHistory(ticker, period, adjusted) {
  const response = await api.get(`/stocks/${ticker}/history`, {
    params: { period, adjusted },
  })
  return response.data
}
