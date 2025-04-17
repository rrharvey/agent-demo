import { queryOptions } from '@tanstack/react-query'
import { ProjectsList } from '../models'
import { api } from './client'

/**
 * Projects API service for fetching projects data
 */
const projectsApi = {
  /**
   * Get all projects with client information
   * @returns Promise with validated projects list
   */
  async getAllProjects(): Promise<ProjectsList> {
    const response = await api.get('projects').json()
    // Validate response data using the Zod schema
    return ProjectsList.parse(response)
  },
}

export const projectsQueryOptions = () =>
  queryOptions({
    queryKey: ['projects'],
    queryFn: projectsApi.getAllProjects,
  })
