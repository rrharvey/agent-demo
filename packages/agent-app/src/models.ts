import { z } from 'zod'

type ImageDetail = 'auto' | 'low' | 'high'

type MessageContentImageUrl = {
  type: 'image_url'
  image_url:
    | string
    | {
        url: string
        detail?: ImageDetail | undefined
      }
}
type MessageContentText = {
  type: 'text'
  text: string
}
type MessageContentComplex = MessageContentText | MessageContentImageUrl

export type MessageContent = string | MessageContentComplex[]

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

export const InterruptValue = z.object({
  tool_call: ToolCall,
})

export type InterruptValue = z.infer<typeof InterruptValue>

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
export const ProjectsList = z.object({
  projects: z.array(Project),
})

// Type for the entire projects list
export type ProjectsList = z.infer<typeof ProjectsList>
