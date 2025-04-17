import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import React, { useState } from 'react'
import { TimeEntry } from '../api/types'
// MUI imports
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, FilterAlt as FilterIcon } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { getAllClientsQuery } from '../api/clientsService'
import { getTimeEntriesForUserQuery, timeEntriesService, timeEntryKeys } from '../api/timeEntriesService'

export function TimeEntryList() {
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null)

  // Set up date range for filtering (default to current month)
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [startDate, setStartDate] = useState(format(firstDayOfMonth, 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(lastDayOfMonth, 'yyyy-MM-dd'))

  // Use the query options pattern for fetching time entries
  const {
    data: timeEntries,
    isLoading: isLoadingTimeEntries,
    isError: isErrorTimeEntries,
    error: timeEntriesError,
  } = useQuery(
    getTimeEntriesForUserQuery({
      userId: 'user1234',
      startDate,
      endDate,
    }),
  )

  // Use the query options pattern for fetching clients
  const { data: clients, isLoading: isLoadingClients } = useQuery(getAllClientsQuery())

  // Set up mutation for deleting entries
  const deleteMutation = useMutation({
    mutationFn: (timeEntryId: number) => timeEntriesService.deleteTimeEntry(timeEntryId),
    onSuccess: (_, timeEntryId) => {
      // Invalidate the time entries query to refresh the list
      queryClient.removeQueries({ queryKey: timeEntryKeys.single(timeEntryId) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all() })
      setDeleteDialogOpen(false)
    },
  })

  const handleDeleteClick = (id: number) => {
    setEntryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (entryToDelete !== null) {
      deleteMutation.mutate(entryToDelete)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setEntryToDelete(null)
  }

  // Helper function to find project name by ID
  const getProjectDetails = (projectId: string): { projectName: string; clientName: string } | null => {
    if (!clients) return null

    for (const client of clients.clients) {
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

  // Group time entries by week
  const groupTimeEntriesByWeek = (entries: TimeEntry[]) => {
    const weeks: { [key: string]: TimeEntry[] } = {}

    entries.forEach((entry) => {
      // Create a date with a fixed time to avoid timezone issues
      // Use noon (12:00) to ensure the date doesn't shift due to timezone differences
      const entryDate = new Date(`${entry.date}T12:00:00`)

      // Use Monday as start of week (1) and Sunday as end of week (0)
      const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(entryDate, { weekStartsOn: 1 })
      const weekKey = `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`

      if (!weeks[weekKey]) {
        weeks[weekKey] = []
      }
      weeks[weekKey].push(entry)
    })

    return weeks
  }

  if (isLoadingTimeEntries || isLoadingClients) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isErrorTimeEntries) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {(timeEntriesError as Error).message}
      </Alert>
    )
  }

  // Sort time entries by date (ascending) and then by client name
  const timeEntriesList = [...(timeEntries?.timeEntries || [])].sort((a, b) => {
    // First, sort by date in ascending order (oldest first)
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()

    if (dateA !== dateB) {
      return dateA - dateB
    }

    // For same dates, sort by client name
    const detailsA = getProjectDetails(a.projectId)
    const detailsB = getProjectDetails(b.projectId)

    const clientNameA = detailsA?.clientName || ''
    const clientNameB = detailsB?.clientName || ''

    return clientNameA.localeCompare(clientNameB)
  })

  const groupedEntries = groupTimeEntriesByWeek(timeEntriesList)

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Demo Time Entry
        </Typography>
        <Button component={Link} to="/time-entries/new" variant="contained" color="primary" startIcon={<AddIcon />}>
          Add New Entry
        </Button>
      </Box>

      <Paper component="form" onSubmit={handleFilterChange} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            id="startDate"
            name="startDate"
            label="Start Date"
            type="date"
            defaultValue={startDate}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { max: endDate },
            }}
            sx={{ minWidth: 300 }}
          />
          <TextField
            id="endDate"
            name="endDate"
            label="End Date"
            type="date"
            defaultValue={endDate}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: startDate },
            }}
            sx={{ minWidth: 300 }}
          />
          <Button type="submit" variant="text" startIcon={<FilterIcon />}>
            Filter
          </Button>
        </Stack>
      </Paper>

      {timeEntriesList.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No time entries found for the selected period.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="time entries table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell align="center" sx={{ width: '100px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedEntries).map(([week, entries]) => {
                const weeklyTotal = entries.reduce((total, entry) => total + entry.hours, 0).toFixed(2)
                return (
                  <React.Fragment key={week}>
                    <TableRow sx={{ backgroundColor: 'primary.light', opacity: 0.8 }}>
                      <TableCell colSpan={2} sx={{ py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium', color: 'white' }}>
                          {week}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium', color: 'white' }}>
                          {weeklyTotal}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }} />
                    </TableRow>
                    {entries.map((entry: TimeEntry) => {
                      const projectDetails = getProjectDetails(entry.projectId)
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {entry.date ? format(new Date(`${entry.date}T12:00:00`), 'EEE, MMM dd') : ''}
                          </TableCell>
                          <TableCell>
                            {projectDetails ? (
                              <>
                                <Typography variant="subtitle2" color="primary.dark">
                                  {projectDetails.clientName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {projectDetails.projectName}
                                </Typography>
                              </>
                            ) : (
                              entry.projectId
                            )}
                          </TableCell>
                          <TableCell>{entry.hours}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Edit time entry">
                                <IconButton
                                  component={Link}
                                  to={`/time-entries/${entry.id}`}
                                  size="small"
                                  color="secondary"
                                  aria-label="edit"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete time entry">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(entry.id)}
                                  disabled={deleteMutation.isPending}
                                  aria-label="delete"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this time entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
