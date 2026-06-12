import { createContext, useState, useCallback } from 'react'

export const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    isLoading,
    setIsLoading,
    error,
    setError,
    clearError,
    user,
    setUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
