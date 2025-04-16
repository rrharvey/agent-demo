import type { Message } from '@langchain/langgraph-sdk'
import { ContentRenderer } from './ContentRenderer'
import { ProjectsList } from './ProjectsList'
import { MessageContent } from '../models'

export const MessageCard = ({ message }: { message: Message }) => {
  return (
    <div className={`message ${message.type === 'human' ? 'user-message' : 'ai-message'}`}>
      <div className="message-header">{message.type === 'human' ? 'You' : 'Assistant'}</div>
      <div className="message-content">
        {message.type === 'tool' && message.name === 'get_projects' ? (
          <ProjectsList content={message.content as string} />
        ) : (
          <ContentRenderer content={message.content as MessageContent} />
        )}
      </div>
    </div>
  )
}
