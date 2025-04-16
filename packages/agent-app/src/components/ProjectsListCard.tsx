import { ToolMessage } from '@langchain/langgraph-sdk'
import { Project, ProjectsList } from '../models'
import { isStringContent } from '../contentTypes'

export const ProjectsListCard = ({ message }: { message: ToolMessage }) => {
  if (!isStringContent(message.content)) {
    throw new Error('Unexpected content type for get_projects tool message.')
  }

  const projects = ProjectsList.parse(JSON.parse(message.content)).projects

  // Separate Intertech projects from other clients' projects
  const intertechProjects = projects.filter((project) => project.clientName === 'Intertech')
  const otherProjectsByClient = projects
    .filter((project) => project.clientName !== 'Intertech')
    .reduce((acc, project) => {
      // Group projects by client
      const client = project.clientName || 'No Client'
      if (!acc[client]) acc[client] = []
      acc[client].push(project)
      return acc
    }, {} as Record<string, Project[]>)

  return (
    <div className="message ai-message project-list">
      <h3>Projects</h3>

      {/* Intertech Projects Section */}
      {intertechProjects.length > 0 && (
        <div className="client-group">
          <h4>Intertech</h4>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              paddingLeft: '0.5rem',
            }}
          >
            {intertechProjects
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
      )}

      {/* Other Clients' Projects Section */}
      {Object.entries(otherProjectsByClient)
        .sort(([clientA], [clientB]) => clientA.localeCompare(clientB))
        .map(([client, clientProjects]) => (
          <div key={client} className="client-group">
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
