import type { Message } from '@langchain/langgraph-sdk'
import { isAIMessage, isHumanMessage } from '../messageTypes'
import { AIMessageCard } from './AIMessageCard'
import { HumanMessageCard } from './HumanMessageCard'

export const MessageRenderer = ({
  message,
  isLoading,
  userMessageId,
}: {
  message: Message
  isLoading: boolean
  userMessageId?: string
}) => {
  if (isHumanMessage(message)) {
    return <HumanMessageCard message={message} />
  }
  if (isAIMessage(message)) {
    return <AIMessageCard message={message} isLoading={isLoading} userMessageId={userMessageId} />
  }

  return null
}
