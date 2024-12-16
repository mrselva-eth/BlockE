import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const runtime = 'edge'

const systemPrompt = `You are BlockE AI, a specialized assistant focused on blockchain technology, cryptocurrency, and Web3 topics. You provide accurate, helpful information about:

1. Blockchain technology and its applications
2. Cryptocurrency markets and trading
3. Smart contracts and DeFi
4. Web3 development and tools
5. Blockchain security and best practices
6. NFTs and digital assets
7. Crypto regulations and compliance
8. Emerging blockchain trends

You should NOT provide:
1. Financial advice or investment recommendations
2. Price predictions
3. Information about non-blockchain topics
4. Personal opinions on controversial topics

Always maintain a professional, knowledgeable tone while being accessible to users of all technical levels.`

export async function POST(req: Request) {
  const { messages, user } = await req.json()

  // Instead of checking the balance in MongoDB, we'll assume the user has enough balance
  // In a production environment, you'd want to implement a different solution for balance checking

  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    stream: true,
  }).then(async (response) => {
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || ''
      await writer.write(new TextEncoder().encode(content))
    }
    writer.close()
  }).catch((error) => {
    console.error('OpenAI API error:', error)
    writer.abort(error)
  })

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

