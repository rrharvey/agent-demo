import type { Message } from '@langchain/langgraph-sdk'
import { ContentRenderer } from './ContentRenderer'
import { ProjectsList } from './ProjectsList'
import { MessageContent } from '../models'

export const MessageCard = ({ message }: { message: Message }) => {
  if (message.type === 'tool' && message.name === 'get_projects') {
    return <ProjectsList content={message.content as string} />
  } else {
    return <ContentRenderer content={message.content as MessageContent} />
  }
}
