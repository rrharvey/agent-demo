import { apiClient, handleApiResponse } from './client'
import { TimeEntry, TimeEntryCreateDto, TimeEntryUpdateDto, GetTimeEntriesParams, GetTimeEntriesResult } from './types'

// Time entries API service
export const timeEntriesService = {
  // Get time entries for a user with optional filtering
  async getTimeEntries(params: GetTimeEntriesParams): Promise<GetTimeEntriesResult> {
    // Validate input parameters
    const validatedParams = GetTimeEntriesParams.parse(params)

    const searchParams = new URLSearchParams()
    searchParams.append('userId', validatedParams.userId)

    if (validatedParams.projectId) {
      searchParams.append('projectId', validatedParams.projectId)
    }

    if (validatedParams.startDate) {
      searchParams.append('startDate', validatedParams.startDate)
    }

    if (validatedParams.endDate) {
      searchParams.append('endDate', validatedParams.endDate)
    }

    return handleApiResponse<GetTimeEntriesResult>(
      apiClient.get('time-entries', { searchParams }),
      GetTimeEntriesResult,
    )
  },

  // Create a new time entry
  async createTimeEntry(entry: TimeEntryCreateDto): Promise<TimeEntry> {
    // Validate input data
    const validatedEntry = TimeEntryCreateDto.parse(entry)

    return handleApiResponse<TimeEntry>(apiClient.post('time-entries', { json: validatedEntry }), TimeEntry)
  },

  // Update an existing time entry
  async updateTimeEntry(entry: TimeEntryUpdateDto): Promise<TimeEntry> {
    // Validate input data
    const validatedEntry = TimeEntryUpdateDto.parse(entry)

    return handleApiResponse<TimeEntry>(
      apiClient.put(`time-entries/${validatedEntry.id}`, { json: validatedEntry }),
      TimeEntry,
    )
  },

  // Delete a time entry
  async deleteTimeEntry(id: number): Promise<void> {
    await apiClient.delete(`time-entries/${id}`)
  },
}
