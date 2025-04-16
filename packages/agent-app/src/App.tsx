'use client'

import type { Message } from '@langchain/langgraph-sdk'
import { useStream } from '@langchain/langgraph-sdk/react'
import { useEffect, useRef } from 'react'
import { MessageCard } from './components/MessageCard'

export default function App() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const thread = useStream<{ messages: Message[] }>({
    apiUrl: 'http://localhost:2024',
    assistantId: 'time_entry',
  })

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread.messages])

  // Set focus to input field when assistant finishes responding
  useEffect(() => {
    if (!thread.isLoading && thread.messages.length > 0) {
      inputRef.current?.focus()
    }
  }, [thread.isLoading, thread.messages.length])

  const chatMessages = thread.messages

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {chatMessages.map((message) => (
          <div key={message.id} className={`message ${message.type === 'human' ? 'user-message' : 'ai-message'}`}>
            <div className="message-header">{message.type === 'human' ? 'You' : 'Assistant'}</div>
            <div className="message-content">
              <MessageCard message={message} />
            </div>
          </div>
        ))}
        {thread.isLoading && (
          <div className="message ai-message">
            <div className="message-header">Assistant</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="message-input-form"
        onSubmit={(e) => {
          e.preventDefault()

          const form = e.target as HTMLFormElement
          const message = new FormData(form).get('message') as string

          if (!message.trim()) return

          form.reset()
          thread.submit({ messages: [{ type: 'human', content: message }] })
        }}
      >
        <input
          ref={inputRef}
          type="text"
          name="message"
          placeholder="Type your message here..."
          disabled={thread.isLoading}
          className="message-input"
        />

        <button type="submit" disabled={thread.isLoading} className="send-button">
          Send
        </button>

        {thread.isLoading && (
          <button type="button" onClick={() => thread.stop()} className="stop-button">
            Stop
          </button>
        )}
      </form>
    </div>
  )
}
