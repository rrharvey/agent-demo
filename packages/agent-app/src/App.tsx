'use client'

import type { Message } from '@langchain/langgraph-sdk'
import { useStream } from '@langchain/langgraph-sdk/react'
import { usePrefetchQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { projectsOptions } from './api'
import { LoadingIndicator } from './components/LoadingIndicator'
import { MessageRenderer } from './components/MessageRenderer'
import { MicrophoneButton } from './components/MicrophoneButton'
import { TimeEntryApproval } from './components/TimeEntryApproval'
import { InterruptValue } from './models'

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [transcript, setTranscript] = useState('')
  const { messages, isLoading, submit, stop, interrupt } = useStream<{ messages: Message[] }>({
    apiUrl: 'http://localhost:2024',
    assistantId: 'time_entry',
  })

  const {
    transcript: currentTranscript,
    listening,
    resetTranscript,
  } = useSpeechRecognition({
    clearTranscriptOnListen: true,
    commands: [],
  })

  // Update input field with speech recognition transcript
  useEffect(() => {
    if (currentTranscript && inputRef.current) {
      inputRef.current.value = currentTranscript
      setTranscript(currentTranscript)
    }
  }, [currentTranscript])

  // Auto-submit when speech recognition ends
  useEffect(() => {
    // Only try to submit if we were listening and now we're not (recognition ended)
    // AND we have content in the transcript
    if (!listening && transcript.trim() && formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    }
  }, [listening, transcript])

  usePrefetchQuery(projectsOptions())

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

  // Find the most recent AI and human messages
  const reversed = [...localMessages].reverse()
  const lastAIMessage = reversed.find((message) => message.type === 'ai')
  const lastHumanMessage = reversed.find((message) => message.type === 'human')

  const handleVoiceInput = () => {
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      SpeechRecognition.startListening()
    }
  }

  return (
    <div className="chat-container">
      <form
        ref={formRef}
        className="message-input-form"
        onSubmit={(e) => {
          e.preventDefault()

          const form = e.target as HTMLFormElement
          const messageText = (new FormData(form).get('message') as string) || transcript

          if (!messageText.trim()) return

          form.reset()
          resetTranscript()
          setTranscript('')

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
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            name="message"
            placeholder="Type your time entry or question here..."
            disabled={isLoading || !!interruptValue}
            className="message-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form-type="other"
            autoFocus
            onChange={(e) => setTranscript(e.target.value)}
            value={transcript}
          />
          <MicrophoneButton listening={listening} onClick={handleVoiceInput} />
        </div>

        <button type="submit" disabled={isLoading || !!interruptValue} className="send-button">
          Send
        </button>

        {isLoading && (
          <button type="button" onClick={() => stop()} className="stop-button">
            Stop
          </button>
        )}
      </form>

      <div className="chat-messages">
        {lastHumanMessage && (
          <MessageRenderer
            key={lastHumanMessage.id || `local-${Date.now()}`}
            message={lastHumanMessage}
            isLoading={isLoading}
          />
        )}
        {lastAIMessage && (
          <MessageRenderer
            key={lastAIMessage.id || `local-${Date.now()}`}
            message={lastAIMessage}
            isLoading={isLoading}
            userMessageId={lastHumanMessage?.id}
          />
        )}
        {lastHumanMessage && !lastAIMessage && <LoadingIndicator />}
        {review && (
          <TimeEntryApproval
            toolCall={interruptValue.tool_call}
            onApprove={() => {
              submit(undefined, { command: { resume: { action: 'approve' } } })
            }}
            onUpdate={(data) => {
              submit(undefined, { command: { resume: { action: 'update', data } } })
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
