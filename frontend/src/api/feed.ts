import client from './client'
import type { Post, Comment } from './types'

export const getFeed = async (): Promise<Post[]> => {
  const { data } = await client.get('/feed')
  return data
}

export const createPost = async (body: { content: string; media_urls: string[] }): Promise<Post> => {
  const { data } = await client.post('/posts', body)
  return data
}

export const toggleLike = async (postId: string): Promise<{ liked: boolean; likes_count: number }> => {
  const { data } = await client.post(`/posts/${postId}/like`)
  return data
}

export const deletePost = async (postId: string): Promise<void> => {
  await client.delete(`/posts/${postId}`)
}

export const getComments = async (postId: string): Promise<Comment[]> => {
  const { data } = await client.get(`/posts/${postId}/comments`)
  return data
}

export const addComment = async (postId: string, content: string): Promise<Comment> => {
  const { data } = await client.post(`/posts/${postId}/comments`, { content })
  return data
}
