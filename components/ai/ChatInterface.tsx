'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import Image from 'next/image'
import { useAIBalance } from '@/hooks/useAIBalance'
import { format } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

export default function ChatInterface() {
  const { address } = useWallet()
  const { balance, deductToken, refreshBalance } = useAIBalance()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadMessages = () => {
      if (address) {
        const storedMessages = localStorage.getItem(`chatMessages_${address.toLowerCase()}`)
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages)
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // Calculate 24 hours ago
          const recentMessages = parsedMessages.filter((msg: Message) => {
            return new Date(msg.timestamp) > twentyFourHoursAgo
          })
          setMessages(recentMessages)
        } else {
          setMessages([])
        }
      }
    }

    loadMessages()
    // Re-run this effect when the address changes
  }, [address])

  useEffect(() => {
    if (address && messages.length > 0) {
      localStorage.setItem(`chatMessages_${address.toLowerCase()}`, JSON.stringify(messages))
    }
  }, [messages, address])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (balance <= 0) {
      setError('Insufficient BE tokens. Please deposit more tokens to continue chatting.')
      return
    }
    if (!input.trim()) return

    setIsLoading(true)
    setError(null)

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(({ role, content }) => ({
          role,
          content
        })),
        user: address,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch response')
    }

    if (response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiMessage: Message = { id: Date.now().toString(), role: 'assistant', content: '', timestamp: new Date().toISOString() }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        aiMessage.content += chunk

        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage.role === 'assistant') {
            lastMessage.content = aiMessage.content
          } else {
            newMessages.push(aiMessage)
          }
          return newMessages
        })
      }
    }

    await deductToken()
    await refreshBalance() // Refresh balance after deducting a token
  } catch (error) {
    console.error('Error:', error)
    setError('An error occurred while fetching the response. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

const handleDeleteHistory = () => {
  setMessages([])
  if (address) {
    localStorage.removeItem(`chatMessages_${address.toLowerCase()}`)
  }
}

return (
  <div className="flex flex-col h-full">
    {/* Chat Title */}
    <div className="flex items-center justify-center py-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Image src="/BEAI.png" alt="BlockE AI" width={32} height={32} />
        <h1 className="text-xl font-bold text-gray-800">BlockE AI</h1>
      </div>
    </div>

    {/* Messages Area */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-3 ${
            message.role === 'assistant' ? 'justify-start' : 'justify-end'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/BEAI.png"
                alt="BlockE AI"
                width={32}
                height={32}
              />
            </div>
          )}
          <div className="flex flex-col">
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === 'assistant'
                  ? 'bg-white border border-[#4F46E5] text-black chat-text'
                  : 'bg-[#4F46E5] text-white chat-text'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {format(new Date(message.timestamp), 'HH:mm:ss')}
            </div>
          </div>
          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={isCEO ? "/ceo.png" : "/user.png"}
                alt={isCEO ? "CEO" : "User"}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* Error Message */}
    {error && (
      <div className="p-4 bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    )}

    {/* Input Area */}
    <form onSubmit={handleSubmit} className="p-4 bg-white/50 backdrop-blur-sm">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDeleteHistory}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          title="Delete chat history"
        >
          <Trash2 size={20} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about crypto, blockchain, or smart contracts..."
          className="flex-1 rounded-lg border border-[#4F46E5] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-black bg-white/90 placeholder:text-gray-500 chat-text"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn-23"
          disabled={isLoading || !input.trim()}
        >
          <span>{isLoading ? 'Sending...' : 'Send'}</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        1 BE token per message • Available balance: {balance} BE
      </p>
    </form>
  </div>
)
}

