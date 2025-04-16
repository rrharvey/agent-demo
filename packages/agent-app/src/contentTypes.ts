// Define the types internally rather than importing them
type ImageDetail = 'auto' | 'low' | 'high'

type MessageContentToolUse = {
  type: 'tool_use'
  input: unknown
  name: string
  id: string
}

type MessageContentImageUrl = {
  type: 'image_url'
  image_url:
    | string
    | {
        url: string
        detail?: ImageDetail | undefined
      }
}

type MessageContentText = {
  type: 'text'
  text: string
}

export type MessageContentComplex = MessageContentText | MessageContentImageUrl | MessageContentToolUse
export type MessageContent = string | MessageContentComplex[]

/**
 * Type guard to check if content is a string
 */
export function isStringContent(content: unknown): content is string {
  return typeof content === 'string'
}

/**
 * Type guard to check if content is text content
 */
export function isTextContent(content: unknown): content is MessageContentText {
  return typeof content === 'object' && content !== null && 'type' in content && content.type === 'text'
}

/**
 * Type guard to check if content is image URL content
 */
export function isImageUrlContent(content: unknown): content is MessageContentImageUrl {
  return typeof content === 'object' && content !== null && 'type' in content && content.type === 'image_url'
}

/**
 * Type guard to check if content is tool use content
 */
export function isToolUseContent(content: unknown): content is MessageContentToolUse {
  return typeof content === 'object' && content !== null && 'type' in content && content.type === 'tool_use'
}

/**
 * Type guard to check if content is complex content array
 */
export function isComplexContentArray(content: unknown): content is MessageContentComplex[] {
  return (
    Array.isArray(content) &&
    content.every((item) => isTextContent(item) || isToolUseContent(item) || isImageUrlContent(item))
  )
}
