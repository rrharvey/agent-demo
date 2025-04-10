import { z } from 'zod'

// Zod schemas for validation
export const TimeEntry = z.object({
  id: z.number(),
  projectId: z.string(),
  userId: z.string(),
  date: z.string(), // ISO date string format
  hours: z.number().positive(),
})

// Client and Project models
export const Project = z.object({
  id: z.string(),
  name: z.string(),
  clientId: z.string(),
})

export const Client = z.object({
  id: z.string(),
  name: z.string(),
  projects: z.array(Project),
})

export const GetAllClientsResult = z.object({
  clients: z.array(Client),
})

export const TimeEntryCreateDto = z.object({
  projectId: z.string(),
  userId: z.string(),
  date: z.string(),
  hours: z.number().positive(),
})

export const TimeEntryUpdateDto = z.object({
  id: z.number(),
  projectId: z.string(),
  userId: z.string(),
  date: z.string(),
  hours: z.number().positive(),
})

export const GetTimeEntriesParams = z.object({
  userId: z.string(),
  projectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const GetTimeEntriesResult = z.object({
  timeEntries: z.array(TimeEntry),
})

export const GetTimeEntryByIdResult = z.object({
  timeEntry: TimeEntry.nullable(),
})

// Time entry types - inferred from Zod schemas
export type TimeEntry = z.infer<typeof TimeEntry>
export type TimeEntryCreateDto = z.infer<typeof TimeEntryCreateDto>
export type TimeEntryUpdateDto = z.infer<typeof TimeEntryUpdateDto>
export type GetTimeEntriesParams = z.infer<typeof GetTimeEntriesParams>
export type GetTimeEntriesResult = z.infer<typeof GetTimeEntriesResult>
export type GetTimeEntryByIdResult = z.infer<typeof GetTimeEntryByIdResult>

// Client and Project types - inferred from Zod schemas
export type Client = z.infer<typeof Client>
export type Project = z.infer<typeof Project>
export type GetAllClientsResult = z.infer<typeof GetAllClientsResult>
