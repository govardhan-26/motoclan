import client from './client'
import type { UserProfile, Post } from './types'

export const getUserProfile = async (username: string): Promise<UserProfile> => {
  const { data } = await client.get(`/users/${username}`)
  return data
}

export const updateProfile = async (body: Partial<UserProfile>): Promise<UserProfile> => {
  const { data } = await client.put('/users/me', body)
  return data
}

export const toggleFollow = async (username: string): Promise<{ following: boolean }> => {
  const { data } = await client.post(`/users/${username}/follow`)
  return data
}

export const searchUsers = async (q: string): Promise<UserProfile[]> => {
  const { data } = await client.get(`/users/search?q=${encodeURIComponent(q)}`)
  return data
}

export const getUserPosts = async (username: string): Promise<Post[]> => {
  const { data } = await client.get(`/users/${username}/posts`)
  return data
}

export const getFollowers = async (username: string): Promise<UserProfile[]> => {
  const { data } = await client.get(`/users/${username}/followers`)
  return data
}

export const getFollowing = async (username: string): Promise<UserProfile[]> => {
  const { data } = await client.get(`/users/${username}/following`)
  return data
}
