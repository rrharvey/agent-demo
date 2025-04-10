import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useState } from 'react'
import { timeEntriesService } from '../api/timeEntriesService'
import { clientsService } from '../api/clientsService'
import { TimeEntry } from '../api/types'

export function TimeEntryList() {
  // Use a mock user ID for now
  const [userId] = useState('user123')
  const queryClient = useQueryClient()

  // Set up date range for filtering (default to current month)
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [startDate, setStartDate] = useState(format(firstDayOfMonth, 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(lastDayOfMonth, 'yyyy-MM-dd'))

  // Fetch time entries
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['timeEntries', userId, startDate, endDate],
    queryFn: () =>
      timeEntriesService.getTimeEntries({
        userId,
        startDate,
        endDate,
      }),
  })

  // Fetch clients and their projects for lookup
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const result = await clientsService.getAllClients()
      return result.clients
    },
  })

  // Set up mutation for deleting entries
  const deleteMutation = useMutation({
    mutationFn: (timeEntryId: number) => timeEntriesService.deleteTimeEntry(timeEntryId),
    onSuccess: () => {
      // Invalidate the time entries query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      deleteMutation.mutate(id)
    }
  }

  // Helper function to find project name by ID
  const getProjectDetails = (projectId: string): { projectName: string; clientName: string } | null => {
    if (!clientsData) return null

    for (const client of clientsData) {
      const project = client.projects.find((p) => p.id === projectId)
      if (project) {
        return {
          projectName: project.name,
          clientName: client.name,
        }
      }
    }
    return null
  }

  // Handle filter changes
  const handleFilterChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newStartDate = formData.get('startDate') as string
    const newEndDate = formData.get('endDate') as string

    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  if (isLoading || isLoadingClients) {
    return <div className="loading">Loading time entries...</div>
  }

  if (isError) {
    return <div className="error">Error: {(error as Error).message}</div>
  }

  const timeEntries = data?.timeEntries || []

  return (
    <div className="time-entries-container">
      <div className="time-entries-header">
        <h2>Time Entries</h2>
        <Link to="/time-entries/new" className="button create-button">
          Add New Entry
        </Link>
      </div>

      <form className="filter-form" onSubmit={handleFilterChange}>
        <div className="filter-controls">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input type="date" id="startDate" name="startDate" defaultValue={startDate} max={endDate} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input type="date" id="endDate" name="endDate" defaultValue={endDate} min={startDate} />
          </div>
          <button type="submit" className="button filter-button">
            Apply Filter
          </button>
        </div>
      </form>

      {timeEntries.length === 0 ? (
        <div className="no-entries">
          <p>No time entries found for the selected period.</p>
        </div>
      ) : (
        <table className="time-entries-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Project</th>
              <th>Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeEntries.map((entry: TimeEntry) => {
              const projectDetails = getProjectDetails(entry.projectId)
              return (
                <tr key={entry.id}>
                  <td>{format(new Date(entry.date), 'MMM dd, yyyy')}</td>
                  <td>
                    {projectDetails ? (
                      <div>
                        <div className="client-name" style={{ fontWeight: 'bold' }}>
                          {projectDetails.clientName}
                        </div>
                        <div className="project-name">{projectDetails.projectName}</div>
                      </div>
                    ) : (
                      entry.projectId
                    )}
                  </td>
                  <td>{entry.hours}</td>
                  <td className="actions-cell">
                    <Link
                      to={`/time-entries/$timeEntryId`}
                      params={{ timeEntryId: entry.id.toString() }}
                      className="button edit-button"
                    >
                      Edit
                    </Link>
                    <button
                      className="button delete-button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
