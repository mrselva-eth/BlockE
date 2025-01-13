'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Trash2, HelpCircle } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import Image from 'next/image'
import { useAIBalance } from '@/hooks/useAIBalance'
import { format } from 'date-fns'
import React from 'react'
import CommandList from './CommandList'

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
  const [animatedContent, setAnimatedContent] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [commandUsed, setCommandUsed] = useState(false);
  const [showCommandList, setShowCommandList] = useState(false)
  const [commandCount, setCommandCount] = useState(0)
  const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, animatedContent, scrollToBottom])

  useEffect(() => {
    const loadMessages = () => {
      if (address) {
        const storedMessages = localStorage.getItem(`chatMessages_${address.toLowerCase()}`)
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages)
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
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
  }, [address])

  useEffect(() => {
    if (address && messages.length > 0) {
      localStorage.setItem(`chatMessages_${address.toLowerCase()}`, JSON.stringify(messages))
    }
  }, [messages, address])

  const formatBotResponse = (text: string) => {
    return text.split('\n').map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.split(/(\*\*.*?\*\*)/).map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const header = part.slice(2, -2)
            return (
              <span key={index} className="font-bold text-purple-600">
                {header}
              </span>
            )
          }
          return <span key={index}>{part}</span>
        })}
        {lineIndex < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  const handleCryptoCommand = async (command: string) => {
    const parts = command.split(' ')
    setCommandUsed(true); // Set commandUsed to true when a command is used
    const action = parts[0].toLowerCase()

    try {
      switch (action) {
        case '/token':
          if (parts.length >= 3) {
            const tokenName = parts[1]
            const ticker = parts[2]
            return await fetchTokenDetails(tokenName, ticker)
          }
          return 'Invalid token command format. Use: /token [name] [ticker]'
        
        case '/top':
          if (parts[1] === 'exchanges') {
            return await fetchTopExchanges()
          } else if (parts[1] === 'crypto') {
            return await fetchTopCrypto()
          }
          return 'Invalid top command. Use: /top exchanges or /top crypto'
        
        case '/market':
          return await fetchMarketData()
        
        case '/trending':
          return await fetchTrendingCoins()
        
        default:
          return null
      }
    } catch (error) {
      console.error('Error in handleCryptoCommand:', error)
      return `An error occurred while processing your request. Please try again later. Error details: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

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

    const isCommand = userMessage.content.startsWith('/')
    try {
      const cryptoResponse = await handleCryptoCommand(input)
      
      if (cryptoResponse) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: cryptoResponse,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMessage])
        setIsTyping(true)
        await animateTyping(cryptoResponse)
        setIsTyping(false)
        await deductToken()
        await refreshBalance()
        return
      }

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

      let botContent = ''
      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let aiMessage: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: '', 
          timestamp: new Date().toISOString() 
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          aiMessage.content += chunk
        }

        setMessages(prev => [...prev, aiMessage])
        setIsTyping(true)
        await animateTyping(aiMessage.content)
        setIsTyping(false)
        botContent = aiMessage.content
      }

      
      const isCommand = userMessage.content.startsWith('/')
      setCommandCount(prevCount => isCommand ? prevCount + 1 : prevCount)

      await fetch('/api/beai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          messages: [{ inputMessage: userMessage.content, outputMessage: botContent }],
          commandUsage: { used: isCommand || commandUsed, count: isCommand ? 1 : 0 },
        }),
      })

      await deductToken()
      await refreshBalance()
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while fetching the response. Please try again.')
    } finally {
      setIsLoading(false)
      setCommandUsed(false); // Reset commandUsed after handling the message
      setIsTyping(false)
    }
  }

  const animateTyping = useCallback(async (text: string) => {
    setIsTyping(true)
    const lines = text.split('\n')
    let animatedLines: string[] = []

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      let currentLine = ''

      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        currentLine += line[charIndex]
        animatedLines[lineIndex] = currentLine
        setAnimatedContent(animatedLines.join('\n'))
        
        scrollToBottom()
        
        const delay = Math.random() * 30 + 10 // 10-40ms delay
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Add a pause at the end of each line
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setIsTyping(false)
  }, [scrollToBottom])

  const handleDeleteHistory = () => {
    setMessages([])
    if (address) {
      localStorage.removeItem(`chatMessages_${address.toLowerCase()}`)
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-center py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Image src="/BEAI.png" alt="BlockE AI" width={32} height={32} />
          <h1 className="text-xl font-bold text-gray-800">BlockE AI</h1>
        </div>
        <button
          onClick={() => setShowCommandList(true)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Show available commands"
        >
          <HelpCircle size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
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
                className={`rounded-lg p-3 max-w-[80%] whitespace-pre-wrap ${
                  message.role === 'assistant'
                    ? 'bg-white border border-[#4F46E5] text-black chat-text'
                    : 'bg-[#4F46E5] text-white chat-text'
                }`}
              >
                {message.role === 'assistant' 
                  ? (index === messages.length - 1 && isTyping
                      ? formatBotResponse(animatedContent)
                      : formatBotResponse(message.content))
                  : message.content
                }
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

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

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
      {showCommandList && <CommandList onClose={() => setShowCommandList(false)} />}
    </div>
  )
}

async function fetchTokenDetails(name: string, ticker: string): Promise<string> {
  try {
    const response = await fetch(`/api/crypto/token?name=${name}&ticker=${ticker}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch token details')
    }

    return `**Token Details:**
Name: ${data.name}
Ticker: ${data.symbol}
Price: $${data.price}
Market Cap: $${data.marketCap}
Volume (24h): $${data.volume24h}
FDV: $${data.fdv}
Vol/Mkt Cap (24h): ${data.volMktCap}
Total Supply: ${data.totalSupply}
Max Supply: ${data.maxSupply || 'N/A'}
Circulating Supply: ${data.circulatingSupply}`
  } catch (error) {
    console.error('Error fetching token details:', error)
    return 'Failed to fetch token details. Please try again later.'
  }
}

async function fetchTopExchanges(): Promise<string> {
  try {
    const response = await fetch('/api/crypto/exchanges')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch exchanges')
    }

    let result = '**Top Exchanges:**\n\n'
    result += data.exchanges.map((exchange: any, index: number) => 
      `${index + 1}. **${exchange.name}**
Volume (24h BTC): ${exchange.volume24h}
Trust Score: ${exchange.trustScore}
Year Established: ${exchange.yearEstablished}
`
    ).join('\n')
    
    return result
  } catch (error) {
    console.error('Error fetching top exchanges:', error)
    
    const fallbackExchanges = [
      { name: "Binance", volume24h: "1,234,567.89", trustScore: 10, yearEstablished: 2017 },
      { name: "Coinbase Exchange", volume24h: "987,654.32", trustScore: 9, yearEstablished: 2012 },
      { name: "Kraken", volume24h: "567,890.12", trustScore: 9, yearEstablished: 2011 },
    ]

    let fallbackResult = '**Top Exchanges (Fallback Data):**\n\n'
    fallbackResult += fallbackExchanges.map((exchange, index) => 
      `${index + 1}. **${exchange.name}**
Volume (24h BTC): ${exchange.volume24h}
Trust Score: ${exchange.trustScore}
Year Established: ${exchange.yearEstablished}
`
    ).join('\n')

    fallbackResult += '\n\nNote: This is fallback data due to an API error. For real-time data, please try again later or contact support.'
    
    return fallbackResult
  }
}

async function fetchTopCrypto(): Promise<string> {
  try {
    const response = await fetch('/api/crypto/top')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch top crypto')
    }

    let result = '**Top 10 Cryptocurrencies:**\n\n'
    result += data.cryptocurrencies.map((crypto: any, index: number) => 
      `${index + 1}. **${crypto.name} (${crypto.symbol})**
Price: $${crypto.price}
Market Cap: $${crypto.marketCap}
24h Change: ${crypto.change24h}%\n`
    ).join('\n')
    
    return result
  } catch (error) {
    console.error('Error fetching top crypto:', error)
    return 'Failed to fetch top cryptocurrencies. Please try again later.'
  }
}

async function fetchMarketData(): Promise<string> {
  try {
    const response = await fetch('/api/crypto/market')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch market data')
    }

    return `**Global Crypto Market Data:**
Total Market Cap: $${data.totalMarketCap}
Total Volume (24h): $${data.totalVolume}
Bitcoin Dominance: ${data.btcDominance}%
Ethereum Dominance: ${data.ethDominance}%
Market Cap Change (24h): ${data.marketCapChange24h}%`
  } catch (error) {
    console.error('Error fetching market data:', error)
    return 'Failed to fetch market data. Please try again later.'
  }
}

async function fetchTrendingCoins(): Promise<string> {
  try {
    const response = await fetch('/api/crypto/trending')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch trending coins')
    }

    let result = '**Top 7 Trending Coins:**\n\n'
    result += data.trendingCoins.map((coin: any, index: number) => 
      `${index + 1}. **${coin.name} (${coin.symbol})**\n` +
      `Market Cap Rank: ${coin.marketCapRank}\n` +
      `Price (BTC): ${coin.priceBtc}\n` +
      `Score: ${coin.score}\n\n`
    ).join('')
    
    return result
  } catch (error) {
    console.error('Error fetching trending coins:', error)
    return 'Failed to fetch trending coins. Please try again later.'
  }
}

