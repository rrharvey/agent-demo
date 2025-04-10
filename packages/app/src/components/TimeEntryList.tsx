import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useState } from 'react'
import { timeEntriesService } from '../api/timeEntriesService'
import { clientsService } from '../api/clientsService'
import { TimeEntry } from '../api/types'
// MUI imports
import {
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
  Alert,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, FilterAlt as FilterIcon } from '@mui/icons-material'

export function TimeEntryList() {
  // Use a mock user ID for now
  const [userId] = useState('user123')
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null)

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {(error as Error).message}
      </Alert>
    )
  }

  const timeEntries = data?.timeEntries || []

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

      {timeEntries.length === 0 ? (
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
              {timeEntries.map((entry: TimeEntry) => {
                const projectDetails = getProjectDetails(entry.projectId)
                return (
                  <TableRow key={entry.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
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
