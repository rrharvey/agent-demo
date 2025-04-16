import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useState } from 'react'
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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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
      userId: 'user123',
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

  const timeEntriesList = timeEntries?.timeEntries || []

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Time Entries
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
          <Table aria-label="time entries table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeEntriesList.map((entry: TimeEntry) => {
                const projectDetails = getProjectDetails(entry.projectId)
                return (
                  <TableRow key={entry.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      {entry.date ? format(new Date(`${entry.date}T00:00:00`), 'EEE, MMM dd, yyyy') : ''}
                    </TableCell>
                    <TableCell>
                      {projectDetails ? (
                        <>
                          <Typography variant="subtitle2">{projectDetails.clientName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {projectDetails.projectName}
                          </Typography>
                        </>
                      ) : (
                        entry.projectId
                      )}
                    </TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/time-entries/${entry.id}`}
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(entry.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
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
