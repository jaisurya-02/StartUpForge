import { useState, useCallback } from 'react'
import apiClient from '../services/api'

export const useApi = (url, method = 'GET') => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (payload = null) => {
      setLoading(true)
      setError(null)
      try {
        const config = {
          method,
          url,
        }
        if (payload && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          config.data = payload
        }
        const response = await apiClient(config)
        setData(response.data)
        return response.data
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [url, method]
  )

  return { data, loading, error, execute }
}
