import type {
  Message,
  HumanMessage,
  AIMessage,
  ToolMessage,
  SystemMessage,
  FunctionMessage,
  RemoveMessage,
} from '@langchain/langgraph-sdk'

/**
 * Type guard to check if a message is a HumanMessage
 * @param message Any message object
 * @returns Boolean indicating if the message is a HumanMessage
 */
export function isHumanMessage(message: Message): message is HumanMessage {
  return message.type === 'human'
}

/**
 * Type guard to check if a message is an AIMessage
 * @param message Any message object
 * @returns Boolean indicating if the message is an AIMessage
 */
export function isAIMessage(message: Message): message is AIMessage {
  return message.type === 'ai'
}

/**
 * Type guard to check if a message is a ToolMessage
 * @param message Any message object
 * @returns Boolean indicating if the message is a ToolMessage
 */
export function isToolMessage(message: Message): message is ToolMessage {
  return message.type === 'tool'
}

/**
 * Type guard to check if a message is a ToolMessage with name 'book_time_entry'
 * @param message Any message object
 * @returns Boolean indicating if the message is a ToolMessage with name 'get_projects'
 */
export function isGetProjectsTollMessage(message: Message): message is ToolMessage {
  return message.type === 'tool' && message.name === 'get_projects'
}

/**
 * Type guard to check if a message is a ToolMessage with name 'book_time_entry'
 * @param message Any message object
 * @returns Boolean indicating if the message is a ToolMessage with name 'book_time_entry'
 */
export function isBookTimeEntryToolMessage(message: Message): message is ToolMessage {
  return message.type === 'tool' && message.name === 'book_time_entry'
}

/**
 * Type guard to check if a message is a SystemMessage
 * @param message Any message object
 * @returns Boolean indicating if the message is a SystemMessage
 */
export function isSystemMessage(message: Message): message is SystemMessage {
  return message.type === 'system'
}

/**
 * Type guard to check if a message is a FunctionMessage
 * @param message Any message object
 * @returns Boolean indicating if the message is a FunctionMessage
 */
export function isFunctionMessage(message: Message): message is FunctionMessage {
  return message.type === 'function'
}

/**
 * Type guard to check if a message is a RemoveMessage
 * @param message Any message object
 * @returns Boolean indicating if the message is a RemoveMessage
 */
export function isRemoveMessage(message: Message): message is RemoveMessage {
  return message.type === 'remove'
}

/**
 * Convenience function to get the display name of a message type
 * @param message Any message object
 * @returns A human-readable representation of the message type
 */
export function getMessageTypeName(message: Message): string {
  switch (message.type) {
    case 'human':
      return 'User'
    case 'ai':
      return 'Assistant'
    case 'tool':
      return `Tool${message.name ? ` (${message.name})` : ''}`
    case 'system':
      return 'System'
    case 'function':
      return 'Function'
    case 'remove':
      return 'Removed'
    default:
      return 'Unknown'
  }
}
