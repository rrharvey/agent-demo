import { useQuery } from '@tanstack/react-query'
import { FormEvent, useEffect, useState } from 'react'
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

  // Initialize form state with values from toolCall
  const [formData, setFormData] = useState<TimeEntryFormData>({
    clientName,
    projectName,
    projectId: projectId || '',
    date: new Date(date).toISOString().split('T')[0], // Format as YYYY-MM-DD for date input
    hours,
  })

  // Track if form has been modified
  const [isModified, setIsModified] = useState(false)

  // Track available projects for selected client
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])

  // Update available projects when client changes or when projects data loads
  useEffect(() => {
    if (projectsData?.projects && formData.clientName) {
      const clientProjects = projectsData.projects.filter((project) => project.clientName === formData.clientName)
      setAvailableProjects(clientProjects)
    } else {
      setAvailableProjects([])
    }
  }, [projectsData?.projects, formData.clientName, setAvailableProjects])

  // Handle client selection change
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target

    // Find projects for the selected client
    const clientProjects = projectsData?.projects?.filter((project) => project.clientName === value) || []

    // If only one project is available, select it automatically
    if (clientProjects.length === 1) {
      const singleProject = clientProjects[0]
      setFormData((prev) => ({
        ...prev,
        clientName: value,
        projectName: singleProject.projectName,
        projectId: singleProject.projectId,
      }))
    } else {
      // Otherwise, just update the client and reset project
      setFormData((prev) => ({
        ...prev,
        clientName: value,
        projectName: '',
        projectId: '',
      }))
    }

    setIsModified(true)
  }

  // Handle project selection change
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    const selectedProject = projectsData?.projects?.find((p) => p.projectId === value)

    if (selectedProject) {
      setFormData((prev) => ({
        ...prev,
        projectId: selectedProject.projectId,
        projectName: selectedProject.projectName,
      }))
      setIsModified(true)
    }
  }

  // Handle form input changes for non-select fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hours' ? parseFloat(value) : value,
    }))
    setIsModified(true)
  }

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onApprove(formData)
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
          <form onSubmit={handleSubmit}>
            <div className="time-entry-form">
              <div className="form-group">
                <label htmlFor="clientName">
                  <strong>Client:</strong>
                </label>
                <select
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleClientChange}
                  required
                  className="form-select"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="projectId">
                  <strong>Project:</strong>
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleProjectChange}
                  required
                  disabled={!formData.clientName}
                  className="form-select"
                >
                  <option value="">Select a project...</option>
                  {availableProjects.map((project) => (
                    <option key={project.projectId} value={project.projectId}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">
                  <strong>Date:</strong>
                </label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="hours">
                  <strong>Hours:</strong>
                </label>
                <input
                  type="number"
                  id="hours"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  step="0.25"
                  min="0.25"
                  required
                />
              </div>

              {isModified && (
                <div className="modified-indicator">
                  <em>Time entry has been modified</em>
                </div>
              )}
            </div>

            <div className="approval-buttons">
              <button type="submit" className="approve-button">
                {isModified ? 'Save Changes' : 'Approve'}
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
