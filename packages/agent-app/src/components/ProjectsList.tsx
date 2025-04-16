import { Project, parseProjectsData } from '../models'

export const ProjectsList = ({ content }: { content: string }) => {
  const projects = parseProjectsData(JSON.parse(content)).projects
  return (
    <div className="projects-container" style={{ fontSize: '0.9rem' }}>
      <h3 style={{ marginBottom: '0.8rem', fontSize: '1.1rem' }}>Projects</h3>
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
          <div key={client} className="client-group" style={{ marginBottom: '0.25rem' }}>
            <h4
              style={{
                fontSize: '0.8rem',
                color: '#444',
              }}
            >
              {client}
            </h4>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                paddingLeft: '0.5rem',
              }}
            >
              {/* Sort projects by project name */}
              {clientProjects
                .sort((a, b) => a.projectName.localeCompare(b.projectName))
                .map((project) => (
                  <li
                    key={project.projectId}
                    style={{
                      padding: '0.1rem 0',
                      fontSize: '0.85rem',
                    }}
                  >
                    {project.projectName}
                  </li>
                ))}
            </ul>
          </div>
        ))}
    </div>
  )
}
