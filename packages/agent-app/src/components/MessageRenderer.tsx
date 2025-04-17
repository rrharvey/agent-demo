import type { Message } from '@langchain/langgraph-sdk'
import { isAIMessage, isHumanMessage } from '../messageTypes'
import { AIMessageCard } from './AIMessageCard'
import { HumanMessageCard } from './HumanMessageCard'

export const MessageRenderer = ({ message, isLoading }: { message: Message; isLoading: boolean }) => {
  if (isHumanMessage(message)) {
    return <HumanMessageCard message={message} />
  }
  if (isAIMessage(message)) {
    return <AIMessageCard message={message} isLoading={isLoading} />
  }

  return null
}
