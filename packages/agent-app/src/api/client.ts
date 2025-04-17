import ky from 'ky'

// Base API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5008'

// Create a preconfigured ky instance
export const api = ky.extend({
  prefixUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get'],
  },
})
