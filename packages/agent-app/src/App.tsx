'use client'

import type { Message } from '@langchain/langgraph-sdk'
import { useStream } from '@langchain/langgraph-sdk/react'
import { useEffect, useRef } from 'react'
import { MessageCard } from './components/MessageCard'
import { TimeEntryApproval } from './components/TimeEntryApproval'
import { LoadingIndicator } from './components/LoadingIndicator'
import { InterruptValue } from './models'

export default function App() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { messages, isLoading, submit, stop, interrupt } = useStream<{ messages: Message[] }>({
    apiUrl: 'http://localhost:2024',
    assistantId: 'time_entry',
  })

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Set focus to input field when assistant finishes responding
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      inputRef.current?.focus()
    }
  }, [isLoading, messages.length])

  const interruptValue = interrupt ? InterruptValue.parse(interrupt.value) : null
  const review = interruptValue?.tool_call.name === 'book_time_entry'

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {review && (
        <TimeEntryApproval
          toolCall={interruptValue.tool_call}
          onApprove={() => {
            submit(undefined, { command: { resume: { action: 'continue' } } })
          }}
          onCancel={() => {
            submit(undefined, {
              command: { resume: { action: 'feedback', data: 'That does not look right. We should start over.' } },
            })
          }}
        />
      )}

      <form
        className="message-input-form"
        onSubmit={(e) => {
          e.preventDefault()

          const form = e.target as HTMLFormElement
          const message = new FormData(form).get('message') as string

          if (!message.trim()) return

          form.reset()
          submit({ messages: [{ type: 'human', content: message }] })
        }}
      >
        <input
          ref={inputRef}
          type="text"
          name="message"
          placeholder="Type your message here..."
          disabled={isLoading}
          className="message-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
        />

        <button type="submit" disabled={isLoading} className="send-button">
          Send
        </button>

        {isLoading && (
          <button type="button" onClick={() => stop()} className="stop-button">
            Stop
          </button>
        )}
      </form>
    </div>
  )
}
