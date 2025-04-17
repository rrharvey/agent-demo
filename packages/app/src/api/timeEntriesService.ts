import { queryOptions } from '@tanstack/react-query'
import { apiClient } from './client'
import {
  GetTimeEntriesParams,
  GetTimeEntriesResult,
  GetTimeEntryByIdResult,
  TimeEntry,
  TimeEntryCreateDto,
  TimeEntryUpdateDto,
} from './types'

// Query option creators for time entries
export const timeEntryKeys = {
  single: (id: number) => ['timeEntry', id] as const,
  forUser: ({ userId, projectId, startDate, endDate }: GetTimeEntriesParams) =>
    ['timeEntries', userId, projectId, startDate, endDate] as const,
  all: () => ['timeEntries'] as const,
}

// Service functions for time entries
export const timeEntriesService = {
  // Get all time entries for a user
  async getTimeEntriesForUser(params: GetTimeEntriesParams): Promise<GetTimeEntriesResult> {
    const queryParams = new URLSearchParams()
    queryParams.append('userId', params.userId)

    if (params.projectId) {
      queryParams.append('projectId', params.projectId)
    }

    if (params.startDate) {
      queryParams.append('startDate', params.startDate)
    }

    if (params.endDate) {
      queryParams.append('endDate', params.endDate)
    }

    return apiClient(`time-entries?${queryParams.toString()}`, { method: 'GET' }).json()
  },

  // Get a specific time entry by ID
  async getTimeEntryById(id: number): Promise<GetTimeEntryByIdResult> {
    return apiClient(`time-entries/${id}`, { method: 'GET' }).json()
  },

  // Create a new time entry
  async createTimeEntry(data: TimeEntryCreateDto): Promise<TimeEntry> {
    return apiClient('time-entries', {
      method: 'POST',
      json: data,
    }).json()
  },

  // Update an existing time entry
  async updateTimeEntry(data: TimeEntryUpdateDto): Promise<TimeEntry> {
    return apiClient(`time-entries/${data.id}`, {
      method: 'PUT',
      json: data,
    }).json()
  },

  // Delete a time entry
  async deleteTimeEntry(id: number): Promise<void> {
    return apiClient(`time-entries/${id}`, { method: 'DELETE' }).json()
  },
}

// Query functions that can be exported and reused
export const getTimeEntryByIdQuery = (id: number) =>
  queryOptions({
    queryKey: timeEntryKeys.single(id),
    queryFn: () => timeEntriesService.getTimeEntryById(id),
    enabled: !!id,
  })

export const getTimeEntriesForUserQuery = (params: GetTimeEntriesParams) =>
  queryOptions({
    queryKey: timeEntryKeys.forUser(params),
    queryFn: () => timeEntriesService.getTimeEntriesForUser(params),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
