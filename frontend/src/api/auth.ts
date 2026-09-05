import client from './client'
import type { LoginRequest, RegisterRequest, RegisterResponse, TokenResponse, UserProfile } from './types'

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await client.post<TokenResponse>('/auth/login', data)
  const { access_token, refresh_token } = response.data
  sessionStorage.setItem('access_token', access_token)
  sessionStorage.setItem('refresh_token', refresh_token)
  return response.data
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await client.post<RegisterResponse>('/auth/register', data)
  // Registration only creates the account — tokens come from the subsequent login call.
  return response.data
}

export async function fetchMe(): Promise<UserProfile> {
  const response = await client.get<UserProfile>('/auth/me')
  return response.data
}

export function logout(): void {
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('refresh_token')
}
