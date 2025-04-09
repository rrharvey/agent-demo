import 'dotenv/config'

import { HumanMessage } from '@langchain/core/messages'
import { ChatAnthropic } from '@langchain/anthropic'

const model = new ChatAnthropic({
  apiKey: process.env.CLAUDE_API_KEY,
  model: 'claude-3-7-sonnet-latest',
  temperature: 0.5,
})

const response = await model.invoke([
  new HumanMessage('What is the capital of France?'),
])

console.log(response.toJSON())
