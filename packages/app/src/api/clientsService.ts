import { queryOptions } from '@tanstack/react-query'
import { apiClient } from './client'
import { Client } from './types'

// Query option creators for clients
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

// Service functions for clients
const clientsService = {
  // Get all clients
  async getAllClients(): Promise<{ clients: Client[] }> {
    return apiClient('clients', { method: 'GET' }).json()
  },
}

// Query functions that can be exported and reused
export const getAllClientsQuery = (filters: Record<string, any> = {}) =>
  queryOptions({
    queryKey: clientKeys.list(filters),
    queryFn: () => clientsService.getAllClients(),
  })
