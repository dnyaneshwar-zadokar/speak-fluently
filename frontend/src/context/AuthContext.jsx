import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// Configure axios base URL - use environment variable or fallback to proxy path
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
axios.defaults.baseURL = API_BASE_URL

// Log the API base URL for debugging
console.log('API Base URL configured as:', API_BASE_URL)

// Add timeout to axios requests for better mobile handling
axios.defaults.timeout = 15000 // 15 seconds

// Development mode - set to false when backend is ready
const DEV_MODE = false

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      if (DEV_MODE) {
        // In dev mode, load user from localStorage
        const savedUser = localStorage.getItem('dev_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
        setLoading(false)
      } else {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        fetchUserProfile()
      }
    } else {
      setLoading(false)
    }
  }, [token])

  // Refresh user data periodically to ensure level progress is up to date
  useEffect(() => {
    if (user && token && !DEV_MODE) {
      // Refresh user data every 5 minutes
      const interval = setInterval(() => {
        refreshUserData();
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...')
      const response = await axios.get('/api/auth/profile')
      console.log('User profile response:', response.data)
      setUser(response.data.user)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      console.error('Error response:', error.response)
      // Don't logout immediately, just log the error
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    if (DEV_MODE) {
      // Mock login for development
      const savedUsers = JSON.parse(localStorage.getItem('dev_users') || '[]')
      const foundUser = savedUsers.find(u => u.email === email)
      
      if (foundUser) {
        const mockToken = 'dev_token_' + Date.now()
        localStorage.setItem('token', mockToken)
        localStorage.setItem('dev_user', JSON.stringify(foundUser))
        setToken(mockToken)
        setUser(foundUser)
        return { success: true }
      } else {
        return {
          success: false,
          error: 'User not found'
        }
      }
    }

    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      
      // Handle specific error cases
      switch (error.response?.status) {
        case 401:
          return {
            success: false,
            error: 'Invalid email or password'
          }
        case 500:
          return {
            success: false,
            error: 'Server error. Please try again later.'
          }
        default:
          return {
            success: false,
            error: error.response.data?.message || `Login failed with status ${error.response.status}`
          }
      }
    }
  }

  const signup = async (name, email, password) => {
    if (DEV_MODE) {
      // Mock signup for development
      const savedUsers = JSON.parse(localStorage.getItem('dev_users') || '[]')
      
      if (savedUsers.find(u => u.email === email)) {
        return {
          success: false,
          error: 'Email already registered'
        }
      }

      const newUser = {
        _id: 'dev_' + Date.now(),
        name,
        email,
        progress: {
          totalMinutes: 0,
          sessionCount: 0,
          streakDays: 0,
          completedLessons: 0
        }
      }

      savedUsers.push(newUser)
      localStorage.setItem('dev_users', JSON.stringify(savedUsers))

      const mockToken = 'dev_token_' + Date.now()
      localStorage.setItem('token', mockToken)
      localStorage.setItem('dev_user', JSON.stringify(newUser))
      setToken(mockToken)
      setUser(newUser)
      return { success: true }
    }

    try {
      const response = await axios.post('/api/auth/register', { 
        username: name,
        email, 
        password 
      })
      
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      return { success: true }
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message)
      
      // Handle specific error cases
      switch (error.response?.status) {
        case 400:
          return {
            success: false,
            error: error.response.data?.message || 'Invalid input data'
          }
        case 500:
          return {
            success: false,
            error: 'Server error. Please try again later.'
          }
        default:
          return {
            success: false,
            error: error.response?.data?.message || 'Signup failed. Please try again.'
          }
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  // Add isAuthenticated property
  const isAuthenticated = !!user && !!token

  // Function to update user level
  const updateUserLevel = (newLevel) => {
    if (user && newLevel) {
      const updatedUser = { ...user, level: newLevel };
      setUser(updatedUser);
      
      // Also update in localStorage for dev mode
      if (DEV_MODE) {
        localStorage.setItem('dev_user', JSON.stringify(updatedUser));
      }
    }
  };

  // Function to refresh user data from backend
  const refreshUserData = async () => {
    if (token && !DEV_MODE) {
      try {
        const response = await axios.get('/api/auth/profile');
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    token,
    isAuthenticated,
    updateUserLevel,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}