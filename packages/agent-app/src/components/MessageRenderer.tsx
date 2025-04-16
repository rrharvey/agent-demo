import type { Message } from '@langchain/langgraph-sdk'
import { isAIMessage, isGetProjectsTollMessage, isHumanMessage } from '../messageTypes'
import { AIMessageCard } from './AIMessageCard'
import { HumanMessageCard } from './HumanMessageCard'
import { ProjectsListCard } from './ProjectsListCard'

export const MessageRenderer = ({ message }: { message: Message }) => {
  if (isHumanMessage(message)) {
    return <HumanMessageCard message={message} />
  }
  if (isAIMessage(message)) {
    return <AIMessageCard message={message} />
  }
  if (isGetProjectsTollMessage(message)) {
    return <ProjectsListCard message={message} />
  }

  return null
}
