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

// Define the schema for a single project
const Project = z.object({
  projectId: z.string().uuid(),
  projectName: z.string().min(1),
  clientName: z.string().min(1),
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
