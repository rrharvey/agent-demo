import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { timeEntriesService } from '../api/timeEntriesService'
import { clientsService } from '../api/clientsService'
import { TimeEntryCreateDto, TimeEntryUpdateDto, Project } from '../api/types'
// MUI imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  SelectChangeEvent,
} from '@mui/material'
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'

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

  // Handle client selection change
  const handleClientChange = (event: SelectChangeEvent<string>) => {
    setSelectedClientId(event.target.value)
  }

  // Handle project selection change
  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    setFormValues((prev) => ({
      ...prev,
      projectId: event.target.value,
    }))
  }

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormValues((prev) => ({
      ...prev,
      [name]: name === 'hours' ? parseFloat(value) : value,
    }))
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (isErrorFetchingClients) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading clients: {(clientsFetchError as Error).message}
      </Alert>
    )
  }

  if (mode === 'edit' && isErrorFetchingTimeEntry) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {(timeEntryFetchError as Error).message}
      </Alert>
    )
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const projects = getProjectsForClient(selectedClientId)
  const noProjectsAvailable = selectedClientId && projects.length === 0

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {mode === 'create' ? 'Create' : 'Edit'} Time Entry
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth required>
                <InputLabel id="client-select-label">Client</InputLabel>
                <Select
                  labelId="client-select-label"
                  id="clientId"
                  name="clientId"
                  value={selectedClientId}
                  label="Client"
                  onChange={handleClientChange}
                >
                  <MenuItem value="">
                    <em>Select a client</em>
                  </MenuItem>
                  {clientsData?.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth required error={Boolean(noProjectsAvailable)}>
                <InputLabel id="project-select-label">Project</InputLabel>
                <Select
                  labelId="project-select-label"
                  id="projectId"
                  name="projectId"
                  value={formValues.projectId}
                  label="Project"
                  onChange={handleProjectChange}
                  disabled={!selectedClientId || projects.length === 0}
                >
                  <MenuItem value="">
                    <em>Select a project</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
                {noProjectsAvailable && <FormHelperText>No projects available for this client</FormHelperText>}
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                id="date"
                name="date"
                label="Date"
                type="date"
                value={formValues.date}
                onChange={handleInputChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                id="hours"
                name="hours"
                label="Hours"
                type="number"
                value={formValues.hours}
                onChange={handleInputChange}
                required
                fullWidth
                inputProps={{ step: '0.25', min: '0', max: '24' }}
              />
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate({ to: '/time-entries' })}
                disabled={isPending}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isPending || !formValues.projectId}
                startIcon={<SaveIcon />}
              >
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
