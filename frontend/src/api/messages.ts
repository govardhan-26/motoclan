import client from './client'
import type { Conversation, Message } from './types'

export const getConversations = async (): Promise<Conversation[]> => {
  const { data } = await client.get('/messages')
  return data
}

export const getThread = async (userId: string): Promise<Message[]> => {
  const { data } = await client.get(`/messages/${userId}`)
  return data
}

export const sendMessage = async (userId: string, content: string): Promise<Message> => {
  const { data } = await client.post(`/messages/${userId}`, { content })
  return data
}
