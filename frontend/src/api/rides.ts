import client from './client'
import type { Ride, JoinRequest } from './types'

export const getRides = async (): Promise<Ride[]> => {
  const { data } = await client.get('/rides')
  return data
}

export const getFeedRides = async (q = ''): Promise<Ride[]> => {
  const { data } = await client.get('/rides/feed', { params: q ? { q } : undefined })
  return data
}

export const getExploreRides = async (q = ''): Promise<Ride[]> => {
  const { data } = await client.get('/rides/explore', { params: q ? { q } : undefined })
  return data
}

export const getRide = async (id: string): Promise<Ride> => {
  const { data } = await client.get(`/rides/${id}`)
  return data
}

export const createRide = async (body: object): Promise<Ride> => {
  const { data } = await client.post('/rides', body)
  return data
}

export const getMyRides = async (): Promise<Ride[]> => {
  const { data } = await client.get('/rides/mine')
  return data
}

export const requestJoinRide = async (id: string): Promise<{ request_id: string; status: string }> => {
  const { data } = await client.post(`/rides/${id}/request-join`)
  return data
}

export const cancelJoinRequest = async (id: string): Promise<void> => {
  await client.post(`/rides/${id}/cancel-request`)
}

export const getRideRequests = async (id: string): Promise<JoinRequest[]> => {
  const { data } = await client.get(`/rides/${id}/requests`)
  return data
}

export const actionRideRequest = async (
  rideId: string,
  requestId: string,
  action: 'approve' | 'reject'
): Promise<{ ok: boolean; action: string; participants_count: number }> => {
  const { data } = await client.put(`/rides/${rideId}/requests/${requestId}`, { action })
  return data
}

// Kept for backward compat — toggles via old endpoint (not used in new UI)
export const toggleJoinRide = async (id: string): Promise<{ joined: boolean; participants_count: number }> => {
  const { data } = await client.post(`/rides/${id}/join`)
  return data
}
