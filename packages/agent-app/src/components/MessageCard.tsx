import type { Message } from '@langchain/langgraph-sdk'
import { MessageContent } from '../models'
import { ContentRenderer } from './ContentRenderer'
import { ProjectsListCard } from './ProjectsList'

export const MessageCard = ({ message }: { message: Message }) => {
  return (
    <div className={`message ${message.type === 'human' ? 'user-message' : 'ai-message'}`}>
      <div className="message-header">{message.type === 'human' ? 'You' : 'Assistant'}</div>
      <div className="message-content">
        {message.type === 'tool' && message.name === 'get_projects' ? (
          <ProjectsListCard content={message.content as string} />
        ) : message.type === 'tool' && message.name === 'book_time_entry' ? null : (
          <ContentRenderer content={message.content as MessageContent} />
        )}
      </div>
    </div>
  )
}
