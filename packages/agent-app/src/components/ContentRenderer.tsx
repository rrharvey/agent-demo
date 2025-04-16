import { isComplexContentArray, isImageUrlContent, isStringContent, isTextContent } from '../contentTypes'

export const ContentRenderer = ({ content }: { content: unknown }) => {
  if (isStringContent(content)) {
    return <>{content}</>
  }

  if (isComplexContentArray(content)) {
    return (
      <>
        {content.map((item, idx) => {
          if (isTextContent(item)) {
            return <div key={idx}>{item.text}</div>
          }

          if (isImageUrlContent(item)) {
            const imageUrl = typeof item.image_url === 'string' ? item.image_url : item.image_url.url

            return <img key={idx} src={imageUrl} alt="Content image" className="content-image" />
          }

          // Don't render anything for tool use
          return null
        })}
      </>
    )
  }

  // Don't render anything if the content is not a string or complex array
  console.warn(content)
  return JSON.stringify(content)
}
