import { useQuery } from '@tanstack/react-query'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { projectsOptions } from '../api'
import { Project, ToolCall } from '../models'

// Interface for TimeEntryApproval props
interface TimeEntryApprovalProps {
  toolCall: ToolCall
  onApprove: (formData: TimeEntryFormData) => void
  onCancel: () => void
}

// Interface for form data
interface TimeEntryFormData {
  clientName: string
  projectName: string
  projectId: string
  date: string
  hours: number
}

export const TimeEntryApproval = ({ toolCall, onApprove, onCancel }: TimeEntryApprovalProps) => {
  const { clientName, projectName, projectId, date, hours } = toolCall.args
  const { data: projectsData, isLoading } = useQuery(projectsOptions())

  // Setup react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<TimeEntryFormData>({
    defaultValues: {
      clientName,
      projectName,
      projectId: projectId || '',
      date: new Date(date).toISOString().split('T')[0], // Format as YYYY-MM-DD for date input
      hours,
    },
  })

  // Watch for form changes
  const watchedClientName = watch('clientName')

  // Group projects by client for dropdown organization
  const clientsWithProjects = projectsData?.projects
    ? projectsData.projects.reduce((acc, project) => {
        const clientName = project.clientName
        if (!acc[clientName]) {
          acc[clientName] = []
        }
        acc[clientName].push(project)
        return acc
      }, {} as Record<string, Project[]>)
    : {}

  // Get unique client names
  const clients = Object.keys(clientsWithProjects)

  // Set available projects based on the currently selected client
  const availableProjects =
    projectsData?.projects && watchedClientName
      ? projectsData.projects.filter((project) => project.clientName === watchedClientName)
      : []

  // Handle project selection change
  const handleProjectChange = (value: string) => {
    const selectedProject = projectsData?.projects?.find((p) => p.projectId === value)
    if (selectedProject) {
      setValue('projectName', selectedProject.projectName, { shouldDirty: true })
    }
  }

  // Handle client selection change
  const handleClientChange = (value: string) => {
    // Get projects for the selected client
    const clientProjects = projectsData?.projects?.filter((project) => project.clientName === value) || []

    // If only one project is available for the selected client, select it automatically
    if (clientProjects.length === 1) {
      const singleProject = clientProjects[0]
      setValue('projectId', singleProject.projectId)
      setValue('projectName', singleProject.projectName)
    } else if (clientProjects.length === 0 && value !== clientName && watch('projectId')) {
      // Reset project fields if client has changed and has no projects
      setValue('projectId', '')
      setValue('projectName', '')
    }
  }

  // Form submission handler
  const onSubmit: SubmitHandler<TimeEntryFormData> = (data) => {
    onApprove(data)
  }

  if (isLoading) {
    return (
      <div className="time-entry-approval">
        <div className="message">
          <div className="message-content">
            <p>Loading project data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="time-entry-approval">
      <div className="message">
        <div className="message-content">
          <p>Please confirm or edit the following time entry:</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="time-entry-form">
              <div className="form-group">
                <label htmlFor="clientName">
                  <strong>Client:</strong>
                </label>
                <Controller
                  name="clientName"
                  control={control}
                  rules={{ required: 'Client is required' }}
                  render={({ field }) => (
                    <select
                      id="clientName"
                      {...field}
                      className="form-select"
                      onChange={(e) => {
                        field.onChange(e)
                        handleClientChange(e.target.value)
                      }}
                    >
                      <option value="">Select a client...</option>
                      {clients.map((client) => (
                        <option key={client} value={client}>
                          {client}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectId">
                  <strong>Project:</strong>
                </label>
                <Controller
                  name="projectId"
                  control={control}
                  rules={{ required: 'Project is required' }}
                  render={({ field }) => (
                    <select
                      id="projectId"
                      {...field}
                      disabled={!watchedClientName}
                      className="form-select"
                      onChange={(e) => {
                        field.onChange(e)
                        handleProjectChange(e.target.value)
                      }}
                    >
                      <option value="">Select a project...</option>
                      {availableProjects.map((project) => (
                        <option key={project.projectId} value={project.projectId}>
                          {project.projectName}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">
                  <strong>Date:</strong>
                </label>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => <input type="date" id="date" {...field} />}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hours">
                  <strong>Hours:</strong>
                </label>
                <Controller
                  name="hours"
                  control={control}
                  rules={{
                    required: 'Hours are required',
                    min: { value: 0.25, message: 'Hours must be at least 0.25' },
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      id="hours"
                      {...field}
                      step="0.25"
                      min="0.25"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </div>

              {isDirty && (
                <div className="modified-indicator">
                  <em>Time entry has been modified</em>
                </div>
              )}
            </div>

            <div className="approval-buttons">
              <button type="submit" className="approve-button">
                {isDirty ? 'Save Changes' : 'Approve'}
              </button>
              <button type="button" onClick={onCancel} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
