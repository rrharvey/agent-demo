'use client'

import { useStream } from '@langchain/langgraph-sdk/react'
import type { Message } from '@langchain/langgraph-sdk'

export default function App() {
  const thread = useStream<{ messages: Message[] }>({
    apiUrl: 'http://localhost:2024',
    assistantId: 'agent',
    messagesKey: 'messages',
  })

  return (
    <div>
      <div>
        {thread.messages.map((message) => (
          <div key={message.id}>{renderContent(message.content)}</div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()

          const form = e.target as HTMLFormElement
          const message = new FormData(form).get('message') as string

          form.reset()
          thread.submit({ messages: [{ type: 'human', content: message }] })
        }}
      >
        <input type="text" name="message" />

        {thread.isLoading ? (
          <button key="stop" type="button" onClick={() => thread.stop()}>
            Stop
          </button>
        ) : (
          <button type="submit">Send</button>
        )}
      </form>
    </div>
  )
}

function renderContent(content: unknown): string {
  if (Array.isArray(content)) {
    return content.map((m) => renderContent(m)).join(' ')
  }
  if (typeof content === 'string') {
    return content
  }
  if (typeof content === 'object' && content !== null && 'text' in content && typeof content.text === 'string') {
    return content.text
  }
  return '???'
}
