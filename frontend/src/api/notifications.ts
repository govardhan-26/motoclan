import client from './client'
import type { Notification } from './types'

export const getNotifications = async (): Promise<Notification[]> => {
  const { data } = await client.get('/notifications')
  return data
}

export const markAllRead = async (): Promise<void> => {
  await client.put('/notifications/read-all')
}

export const markOneRead = async (id: string): Promise<void> => {
  await client.put(`/notifications/${id}/read`)
}
