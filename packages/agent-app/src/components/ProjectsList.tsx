import { Project, parseProjectsData } from '../models'

export const ProjectsList = ({ content }: { content: string }) => {
  const projects = parseProjectsData(JSON.parse(content)).projects
  return (
    <div className="projects-container">
      <h3>Projects</h3>
      {Object.entries(
        projects.reduce((acc, project) => {
          // Group projects by client
          const client = project.clientName || 'No Client'
          if (!acc[client]) acc[client] = []
          acc[client].push(project)
          return acc
        }, {} as Record<string, Project[]>)
      )
        // Sort by client name
        .sort(([clientA], [clientB]) => clientA.localeCompare(clientB))
        .map(([client, clientProjects]) => (
          <div key={client} className="client-group">
            <h4>{client}</h4>
            <ul>
              {/* Sort projects by project name */}
              {clientProjects
                .sort((a, b) => a.projectName.localeCompare(b.projectName))
                .map((project) => (
                  <li key={project.projectId}>{project.projectName}</li>
                ))}
            </ul>
          </div>
        ))}
    </div>
  )
}
