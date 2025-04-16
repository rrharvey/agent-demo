export const LoadingIndicator = () => {
  return (
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
  )
}
