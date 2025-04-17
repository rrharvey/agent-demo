import React from 'react'

interface MicrophoneButtonProps {
  listening: boolean
  onClick: () => void
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ listening, onClick }) => {
  return (
    <button className={`mic-icon-container ${listening ? 'listening' : ''}`} onClick={onClick}>
      <svg
        className="mic-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={listening ? 'Stop voice input' : 'Start voice input'}
      >
        <path
          d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.34 9.65V11.35C4.34 15.57 7.78 19 12 19C16.22 19 19.66 15.57 19.66 11.35V9.65"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 19V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
