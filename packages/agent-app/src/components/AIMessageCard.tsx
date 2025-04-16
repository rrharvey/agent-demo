import { AIMessage } from '@langchain/langgraph-sdk'
import { ContentRenderer } from './ContentRenderer'

export const AIMessageCard = ({ message }: { message: AIMessage }) => {
  return (
    <div className="message ai-message">
      <div className="message-header">Assistant</div>
      <div className="message-content">
        <ContentRenderer content={message.content} />
      </div>
    </div>
  )
}
