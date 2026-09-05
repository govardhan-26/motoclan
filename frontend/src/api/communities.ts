import client from './client'
import type { Community, Post } from './types'

export const getCommunities = async (): Promise<Community[]> => {
  const { data } = await client.get('/communities')
  return data
}

export const getCommunity = async (id: string): Promise<Community> => {
  const { data } = await client.get(`/communities/${id}`)
  return data
}

export const toggleJoinCommunity = async (id: string): Promise<{ joined: boolean; members_count: number }> => {
  const { data } = await client.post(`/communities/${id}/join`)
  return data
}

export const getCommunityPosts = async (id: string): Promise<Post[]> => {
  const { data } = await client.get(`/communities/${id}/posts`)
  return data
}
