'use client'

import type { Message } from '@langchain/langgraph-sdk'
import { useStream } from '@langchain/langgraph-sdk/react'
import { ReactNode, useEffect, useRef } from 'react'
import { parseProjectsData } from './models/projectSchema'

type MessageContentText = {
  type: 'text'
  text: string
}

type MesageContentToolUse = {
  type: 'tool_use'
  name: string
  id: string
  input: Record<string, unknown>
}

type MessageContent = string | MessageContentText | MesageContentToolUse

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

  // Filter only human and AI messages
  // const chatMessages = thread.messages.filter((msg) => msg.type === 'human' || msg.type === 'ai')
  const chatMessages = thread.messages

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {chatMessages.map((message) => (
          <div key={message.id} className={`message ${message.type === 'human' ? 'user-message' : 'ai-message'}`}>
            <div className="message-header">{message.type === 'human' ? 'You' : 'Assistant'}</div>
            <div className="message-content">{renderMessage(message)}</div>
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

function renderMessage(message: Message): ReactNode {
  if (message.type === 'tool' && message.name === 'get_projects') {
    const projects = parseProjectsData(JSON.parse(message.content as unknown as string)).projects
    return (
      <div className="projects-container">
        <h3>Projects</h3>
        {Object.entries(
          projects.reduce((acc, project) => {
            // Group projects by client
            const client = project.clientName || 'No Client'
            if (!acc[client]) acc[client] = []
            acc[client].push(project)
            return acc
          }, {} as Record<string, typeof projects>)
        )
          // Sort by client name
          .sort(([clientA], [clientB]) => clientA.localeCompare(clientB))
          .map(([client, clientProjects]) => (
            <div key={client} className="client-group">
              <h4>{client}</h4>
              <ul>
                {/* Sort projects by project name */}
                {clientProjects
                  .sort((a, b) => a.projectName.localeCompare(b.projectName))
                  .map((project) => (
                    <li key={project.projectId}>{project.projectName}</li>
                  ))}
              </ul>
            </div>
          ))}
      </div>
    )
  } else {
    return renderContent(message.content as MessageContent)
  }
}

function renderContent(content: MessageContent): ReactNode {
  if (Array.isArray(content)) {
    return content.map((m) => renderContent(m)).join(' ')
  } else if (typeof content === 'string') {
    return content
  } else if (content.type === 'text') {
    return content.text
  } else {
    return null
  }
}
