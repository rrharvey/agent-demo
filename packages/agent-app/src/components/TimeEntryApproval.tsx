import { ToolCall } from '../models'

// Interface for TimeEntryApproval props
interface TimeEntryApprovalProps {
  toolCall: ToolCall
  onApprove: () => void
  onCancel: () => void
}

export const TimeEntryApproval = ({ toolCall, onApprove, onCancel }: TimeEntryApprovalProps) => {
  const { clientName, projectName, date, hours } = toolCall.args

  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString()

  return (
    <div className="time-entry-approval">
      <div className="message">
        <div className="message-content">
          <p>Please confirm the following time entry:</p>
          <ul className="time-entry-details">
            <li>
              <strong>Client:</strong> {clientName}
            </li>
            <li>
              <strong>Project:</strong> {projectName}
            </li>
            <li>
              <strong>Date:</strong> {formattedDate}
            </li>
            <li>
              <strong>Hours:</strong> {hours}
            </li>
          </ul>
          <div className="approval-buttons">
            <button onClick={onApprove} className="approve-button">
              Approve
            </button>
            <button onClick={onCancel} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
