import { HumanMessage } from '@langchain/langgraph-sdk'
import { ContentRenderer } from './ContentRenderer'

export const HumanMessageCard = ({ message }: { message: HumanMessage }) => {
  return (
    <div className="message user-message">
      <div className="message-header">You</div>
      <div className="message-content">
        <ContentRenderer content={message.content} />
      </div>
    </div>
  )
}
