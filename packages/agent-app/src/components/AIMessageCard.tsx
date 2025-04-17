import { AIMessage } from '@langchain/langgraph-sdk'
import { ContentRenderer } from './ContentRenderer'

export const AIMessageCard = ({ message, isLoading }: { message: AIMessage; isLoading: boolean }) => {
  return (
    <div className="message ai-message">
      <div className="message-header">
        Assistant
        {isLoading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
      <div className="message-content">
        <ContentRenderer content={message.content} />
      </div>
    </div>
  )
}
