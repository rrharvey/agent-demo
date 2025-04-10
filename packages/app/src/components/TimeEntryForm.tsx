import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { timeEntriesService } from '../api/timeEntriesService'
import { clientsService } from '../api/clientsService'
import { TimeEntry, TimeEntryCreateDto, TimeEntryUpdateDto, Client, Project } from '../api/types'

interface TimeEntryFormProps {
  mode: 'create' | 'edit'
  timeEntryId?: number
}

export function TimeEntryForm({ mode, timeEntryId }: TimeEntryFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Use a mock user ID for now
  const userId = 'user123'

  // Default form values
  const defaultFormValues = {
    projectId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: 0,
  }

  const [formValues, setFormValues] = useState<{
    projectId: string
    date: string
    hours: number
  }>(defaultFormValues)

  const [selectedClientId, setSelectedClientId] = useState<string>('')

  // Fetch clients and their projects
  const {
    data: clientsData,
    isLoading: isLoadingClients,
    isError: isErrorFetchingClients,
    error: clientsFetchError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const result = await clientsService.getAllClients()
      return result.clients
    },
  })

  // Fetch time entry data if in edit mode
  const {
    data: timeEntryData,
    isLoading: isLoadingTimeEntry,
    isError: isErrorFetchingTimeEntry,
    error: timeEntryFetchError,
  } = useQuery({
    queryKey: ['timeEntry', timeEntryId],
    queryFn: async () => {
      if (mode === 'edit' && timeEntryId) {
        // Since we don't have a dedicated endpoint to get a single time entry,
        // we'll get all entries for the user and find the one we need
        const result = await timeEntriesService.getTimeEntries({ userId })
        const entry = result.timeEntries.find((entry) => entry.id === timeEntryId)
        if (!entry) {
          throw new Error('Time entry not found')
        }
        return entry
      }
      return null
    },
    enabled: mode === 'edit' && !!timeEntryId,
  })

  // Get projects for selected client
  const getProjectsForClient = (clientId: string): Project[] => {
    if (!clientsData) return []
    const client = clientsData.find((c) => c.id === clientId)
    return client ? client.projects : []
  }

  // Update form values when time entry data is loaded
  useEffect(() => {
    if (timeEntryData) {
      setFormValues({
        projectId: timeEntryData.projectId,
        date: timeEntryData.date,
        hours: timeEntryData.hours,
      })

      // If we have clients data, set the selected client based on the project ID
      if (clientsData) {
        for (const client of clientsData) {
          const project = client.projects.find((p) => p.id === timeEntryData.projectId)
          if (project) {
            setSelectedClientId(client.id)
            break
          }
        }
      }
    }
  }, [timeEntryData, clientsData])

  // Auto-select project when client is changed
  useEffect(() => {
    if (selectedClientId) {
      const projects = getProjectsForClient(selectedClientId)
      // If there's only one project for this client, auto-select it
      if (projects.length === 1) {
        setFormValues((prev) => ({
          ...prev,
          projectId: projects[0].id,
        }))
      } else if (projects.length > 1 && !projects.some((p) => p.id === formValues.projectId)) {
        // Reset project selection if current project doesn't belong to the selected client
        setFormValues((prev) => ({
          ...prev,
          projectId: '',
        }))
      }
    }
  }, [selectedClientId, clientsData])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TimeEntryCreateDto) => timeEntriesService.createTimeEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      navigate({ to: '/time-entries' })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: TimeEntryUpdateDto) => timeEntriesService.updateTimeEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      navigate({ to: '/time-entries' })
    },
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement
    if (name === 'clientId') {
      setSelectedClientId(value)
    } else {
      setFormValues((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value,
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      if (mode === 'create') {
        const createData: TimeEntryCreateDto = {
          ...formValues,
          userId,
        }
        createMutation.mutate(createData)
      } else if (mode === 'edit' && timeEntryId && timeEntryData) {
        const updateData: TimeEntryUpdateDto = {
          id: timeEntryId,
          ...formValues,
          userId: timeEntryData.userId,
        }
        updateMutation.mutate(updateData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  // Loading state
  if (isLoadingClients || (mode === 'edit' && isLoadingTimeEntry)) {
    return <div className="loading">Loading...</div>
  }

  // Error state
  if (isErrorFetchingClients) {
    return <div className="error">Error loading clients: {(clientsFetchError as Error).message}</div>
  }

  if (mode === 'edit' && isErrorFetchingTimeEntry) {
    return <div className="error">Error: {(timeEntryFetchError as Error).message}</div>
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const projects = getProjectsForClient(selectedClientId)

  return (
    <div className="time-entry-form-container">
      <h2>{mode === 'create' ? 'Create' : 'Edit'} Time Entry</h2>

      <form className="time-entry-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="clientId">Client</label>
          <select id="clientId" name="clientId" value={selectedClientId} onChange={handleInputChange} required>
            <option value="">Select a client</option>
            {clientsData?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="projectId">Project</label>
          <select
            id="projectId"
            name="projectId"
            value={formValues.projectId}
            onChange={handleInputChange}
            required
            disabled={!selectedClientId || projects.length === 0}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {selectedClientId && projects.length === 0 && (
            <div className="form-error">No projects available for this client</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input type="date" id="date" name="date" value={formValues.date} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="hours">Hours</label>
          <input
            type="number"
            id="hours"
            name="hours"
            value={formValues.hours}
            onChange={handleInputChange}
            step="0.25"
            min="0"
            max="24"
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button cancel-button"
            onClick={() => navigate({ to: '/time-entries' })}
            disabled={isPending}
          >
            Cancel
          </button>
          <button type="submit" className="button save-button" disabled={isPending || !formValues.projectId}>
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
