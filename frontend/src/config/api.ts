export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://motoclan-production.up.railway.app'
    : 'http://localhost:8000'
)
