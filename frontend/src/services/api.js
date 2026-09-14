const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const body = await response.json()
      if (body?.detail) message = body.detail
    } catch {
      // Keep the generic message if the response body is not JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

export function getStocks(index = 'EGX100') {
  return request(`/stocks?index=${encodeURIComponent(index)}`)
}

export function getStock(symbol) {
  return request(`/stocks/${encodeURIComponent(symbol)}`)
}

export { API_BASE_URL }
