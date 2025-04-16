import { MessageContent } from '../models'

export const ContentRenderer = ({ content }: { content: MessageContent }) => {
  if (Array.isArray(content)) {
    return (
      <>
        {content.map((m, idx) => (
          <ContentRenderer key={idx} content={m} />
        ))}
      </>
    )
  } else if (typeof content === 'string') {
    return <>{content}</>
  } else if (content.type === 'text') {
    return <>{content.text}</>
  } else {
    return null
  }
}
