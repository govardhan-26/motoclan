import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/api'

export function useRealtimeUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
    if (!token) return

    const url = `${API_BASE_URL}/events?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    // Instant message — refresh thread + conversation list for sender's side
    es.addEventListener('new_message', (e) => {
      const data = JSON.parse(e.data) as { from_user_id: string }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['thread', data.from_user_id] })
    })

    // Any notification type — refresh the notification list + badge
    es.addEventListener('new_notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    // EventSource auto-reconnects on error — no manual handling needed
    es.onerror = () => {}

    return () => es.close()
  }, [queryClient])
}
