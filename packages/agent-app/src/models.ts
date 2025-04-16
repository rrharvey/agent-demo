import { z } from 'zod'

export type MessageContentText = {
  type: 'text'
  text: string
}

export type MesageContentToolUse = {
  type: 'tool_use'
  name: string
  id: string
  input: Record<string, unknown>
}

export type MessageContent = string | MessageContentText | MesageContentToolUse

/*
{
    "name": "book_time_entry",
    "args": {
        "clientName": "Intertech",
        "projectName": "Paid Time Off",
        "projectId": "6764b5a9-cd1f-4943-a3a6-65ef492b9d3e",
        "date": "2025-04-16",
        "hours": 8
    },
    "id": "toolu_018Ak48nHRgrMfmj58f3sF3q",
    "type": "tool_call"
}
*/

const ToolCallBase = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal('tool_call'),
})

// Define the schema for create time entry tool call
const CreateTimeEntryToolCall = ToolCallBase.extend({
  name: z.literal('book_time_entry'),
  args: z.object({
    clientName: z.string(),
    projectName: z.string(),
    projectId: z.string().uuid(),
    date: z.coerce.date(),
    hours: z.number(),
  }),
})

// Define schema for other potential tool types here
// For example:
// const SomeOtherToolCall = ToolCallBase.extend({
//   name: z.literal("some_other_tool"),
//   args: SomeOtherToolSchema,
// })

// Create the discriminated union of all tool calls
export const ToolCall = z.discriminatedUnion('name', [
  CreateTimeEntryToolCall,
  // Add other tool calls here as they're defined
])

// Export the type
export type ToolCall = z.infer<typeof ToolCall>

// Function to parse and validate tool calls
export function parseToolCall(data: unknown): ToolCall {
  return ToolCall.parse(data)
}

// Function to safely attempt parsing tool calls
export function safeParseToolCall(data: unknown) {
  return ToolCall.safeParse(data)
}

// Define the schema for a single project
const Project = z.object({
  projectId: z.string().uuid(),
  projectName: z.string(),
  clientName: z.string(),
})

// Type for a single project
export type Project = z.infer<typeof Project>

// Define the schema for the entire projects list
const ProjectsList = z.object({
  projects: z.array(Project),
})

// Type for the entire projects list
export type ProjectsList = z.infer<typeof ProjectsList>

// Function to parse and validate projects data
export function parseProjectsData(data: unknown): ProjectsList {
  return ProjectsList.parse(data)
}

// Function to safely attempt parsing projects data
export function safeParseProjectsData(data: unknown) {
  return ProjectsList.safeParse(data)
}

export default ProjectsList
