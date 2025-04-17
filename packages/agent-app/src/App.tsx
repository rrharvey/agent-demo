'use client'

import type { Message } from '@langchain/langgraph-sdk'
import { useStream } from '@langchain/langgraph-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { MessageRenderer } from './components/MessageRenderer'
import { TimeEntryApproval } from './components/TimeEntryApproval'
import { InterruptValue } from './models'

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const { messages, isLoading, submit, stop, interrupt } = useStream<{ messages: Message[] }>({
    apiUrl: 'http://localhost:2024',
    assistantId: 'time_entry',
  })

  // Sync backend messages with local state
  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages(messages)
    }
  }, [messages])

  // Set focus to input field when assistant finishes responding
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      inputRef.current?.focus()
    }
  }, [isLoading, messages.length])

  const interruptValue = interrupt ? InterruptValue.parse(interrupt.value) : null
  const review = interruptValue?.tool_call.name === 'book_time_entry'

  // Find the most recent AI message
  const lastAIMessage = [...localMessages].reverse().find((message) => message.type === 'ai')

  return (
    <div className="chat-container">
      <form
        className="message-input-form"
        onSubmit={(e) => {
          e.preventDefault()

          const form = e.target as HTMLFormElement
          const messageText = new FormData(form).get('message') as string

          if (!messageText.trim()) return

          form.reset()

          // Create a local message object with a temporary ID
          const userMessage: Message = {
            id: `local-${Date.now()}`,
            type: 'human',
            content: messageText,
          }

          // Update local messages immediately
          setLocalMessages((prev) => [...prev, userMessage])

          // Then send to backend
          submit({ messages: [{ type: 'human', content: messageText }] })
        }}
      >
        <input
          ref={inputRef}
          type="text"
          name="message"
          placeholder="Type your time entry or question here..."
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

      <div className="chat-messages">
        {lastAIMessage && (
          <MessageRenderer
            key={lastAIMessage.id || `local-${Date.now()}`}
            message={lastAIMessage}
            isLoading={isLoading}
          />
        )}
        {review && (
          <TimeEntryApproval
            toolCall={interruptValue.tool_call}
            onApprove={() => {
              submit(undefined, { command: { resume: { action: 'continue' } } })
            }}
            onCancel={() => {
              submit(undefined, {
                command: { resume: { action: 'cancel' } },
              })
            }}
          />
        )}
      </div>
    </div>
  )
}
