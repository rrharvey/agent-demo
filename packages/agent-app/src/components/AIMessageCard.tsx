import { AIMessage } from '@langchain/langgraph-sdk'
import { useEffect, useRef, useState } from 'react'
import { ContentRenderer } from './ContentRenderer'

export const AIMessageCard = ({
  message,
  isLoading,
  userMessageId,
}: {
  message: AIMessage
  isLoading: boolean
  userMessageId?: string
}) => {
  const [fadeOut, setFadeOut] = useState(false)
  const [hideContent, setHideContent] = useState(false)
  const [contentHeight, setContentHeight] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const prevUserMessageIdRef = useRef(userMessageId)
  const prevMessageIdRef = useRef(message.id)

  // When the userMessageId changes, trigger fade out animation
  useEffect(() => {
    if (prevUserMessageIdRef.current && userMessageId !== prevUserMessageIdRef.current) {
      setFadeOut(true)
      // Don't hide content immediately, wait for animation
      setHideContent(false)
    } else {
      setFadeOut(false)
      setHideContent(false)
      setContentHeight(null) // Reset height constraint when showing new content
    }

    // Update the ref for next comparison
    prevUserMessageIdRef.current = userMessageId
  }, [userMessageId])

  // When the AI message ID changes, ensure fade-out is reset
  useEffect(() => {
    if (message.id !== prevMessageIdRef.current) {
      setFadeOut(false)
      setHideContent(false)
      setContentHeight(null) // Reset height constraint for new messages
    }

    // Update the ref for next comparison
    prevMessageIdRef.current = message.id
  }, [message.id])

  // Add event listener for transitionend to detect when fade-out is complete
  useEffect(() => {
    const contentElement = contentRef.current

    if (!contentElement) return

    // Handler for when the transition completes
    const handleTransitionEnd = () => {
      if (fadeOut) {
        // Store the current height before hiding content
        if (contentElement && contentHeight === null) {
          setContentHeight(0) // Set to collapsed state
        }
        setHideContent(true)
      }
    }

    contentElement.addEventListener('transitionend', handleTransitionEnd)

    // Clean up event listener
    return () => {
      contentElement.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [fadeOut, contentHeight])

  // Style for the message content
  const contentStyle = {
    transition: 'opacity 0.5s ease-out, max-height 0.2s ease-out',
    ...(contentHeight !== null ? { maxHeight: `${contentHeight}px`, overflow: 'hidden' } : {}),
  }

  // Add a slightly darker background for the AI message card
  const cardStyle = {
    backgroundColor: '#d0e1f2', // A darker shade than the default --ai-msg-bg (#e6f0f9)
  }

  return (
    <div className="message ai-message" style={cardStyle}>
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
      <div ref={contentRef} className={`message-content ${fadeOut ? 'fade-out' : ''}`} style={contentStyle}>
        {!hideContent && <ContentRenderer content={message.content} />}
      </div>
    </div>
  )
}
