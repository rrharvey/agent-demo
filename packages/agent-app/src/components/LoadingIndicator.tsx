export const LoadingIndicator = () => {
  return (
    <div className="message ai-message">
      <div className="message-header">
        Assistant
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}
