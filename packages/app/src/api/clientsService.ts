import { apiClient, handleApiResponse } from './client'
import { Client, GetAllClientsResult } from './types'

// Clients API service
export const clientsService = {
  // Get all clients with their projects
  async getAllClients(): Promise<GetAllClientsResult> {
    return handleApiResponse<GetAllClientsResult>(apiClient.get('clients'), GetAllClientsResult)
  },
}
