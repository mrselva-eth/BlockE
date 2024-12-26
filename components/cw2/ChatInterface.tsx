'use client'

import { useState, useEffect } from 'react'
import { Send, Smile, Users } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import dynamic from 'next/dynamic'
import { sendMessage as sendMessageOnChain, sendEmojiReaction } from '@/utils/cw2ContractInteractions'
import { encryptMessage, decryptMessage } from '@/utils/encryption'
import Image from 'next/image'
import { format } from 'date-fns'
import ExceptionMessage from './ExceptionMessage'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface Contact {
  _id: string;
  contactName: string;
  contactAddress: string;
}

interface Group {
  _id: string;
  groupName: string;
  members: string[];
}

interface ChatInterfaceProps {
  selectedContact: Contact | null;
  selectedGroup: Group | null;
  isGroup: boolean;
}

interface Message {
  _id: string;
  senderAddress: string;
  receiverAddress: string;
  encryptedMessage: string;
  isGroup: boolean;
  decryptedMessage?: string;
  createdAt: string;
}

export default function ChatInterface({ selectedContact, selectedGroup, isGroup }: ChatInterfaceProps) {
  const { address } = useWallet()
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exceptionMessage, setExceptionMessage] = useState<string | null>(null)

  const selectedEntity = isGroup ? selectedGroup : selectedContact
  const selectedAddress = isGroup ? selectedGroup?.groupName : selectedContact?.contactAddress

  const fetchMessages = async () => {
    if (!selectedEntity || !address) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/messages?senderAddress=${address}&receiverAddress=${selectedAddress}&isGroup=${isGroup}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const fetchedMessages = await response.json()
      
      const decryptedMessages = await Promise.all(
        fetchedMessages.map(async (msg: Message) => ({
          ...msg,
          decryptedMessage: await decryptMessage(msg.encryptedMessage, address)
        }))
      )
      
      setMessages(decryptedMessages)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError('Failed to load messages. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedEntity && address) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedEntity, address, fetchMessages, selectedAddress, isGroup])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedEntity || !address) return

    setIsLoading(true)
    setError(null)

    try {
      // Only trigger the transaction when actually sending
      await sendMessageOnChain()
      const encryptedMsg = await encryptMessage(message, selectedAddress!)
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderAddress: address,
          receiverAddress: selectedAddress,
          encryptedMessage: encryptedMsg,
          isGroup,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setMessage('')
      await fetchMessages()
      // Send notification to receiver
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: selectedAddress,
          type: 'newMessage',
          content: `New message from ${address}`,
        }),
      })
    } catch (err: any) {
      console.error('Failed to send message:', err)
      if (err.code === 4001) {
        setExceptionMessage("Transaction rejected. Please try again.")
      } else {
        setError(err.message || 'Failed to send message. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEmoji = (emojiObject: { emoji: string }) => {
    setMessage(prev => prev + emojiObject.emoji)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!selectedEntity) {
    return (
      <div className="relative flex items-center justify-center h-full">
        <div className="absolute inset-0 z-0">
          <Image
            src="/cw2background.gif"
            alt="CW2 Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
        </div>
        <div className="relative z-10 text-center p-8 max-w-lg mx-auto">
          <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to CW²
            </h3>
            <p className="text-gray-700">
              {isGroup 
                ? "Select a group to start collaborating with multiple users in a secure, decentralized chat environment." 
                : "Choose a contact to begin a private, encrypted conversation in the world of Web3 messaging."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div>
          <h2 className="font-semibold text-lg">
            {isGroup ? selectedGroup?.groupName : selectedContact?.contactName}
          </h2>
          {isGroup && (
            <div className="flex items-center text-sm text-gray-500">
              <Users size={16} className="mr-1" />
              {selectedGroup?.members.length} members
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isSender = msg.senderAddress.toLowerCase() === address?.toLowerCase()
          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isSender
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/80 border border-gray-200'
                }`}
              >
                {isGroup && !isSender && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {msg.senderAddress.slice(0, 6)}...{msg.senderAddress.slice(-4)}
                  </p>
                )}
                <p className="break-words whitespace-pre-wrap">{msg.decryptedMessage}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {format(new Date(msg.createdAt), 'HH:mm')}
              </span>
            </div>
          )
        })}
      </div>

      <div className="p-3 bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-gray-500 hover:text-purple-500 transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>
          <input
            type="text"
            placeholder={`Message ${isGroup ? 'group' : selectedContact?.contactName}...`}
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
          >
            <Send size={20} />
          </button>
        </div>
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50">
            <EmojiPicker onEmojiClick={handleAddEmoji} />
          </div>
        )}
        {error && (
          <p className="text-red-500 mt-2 text-sm">{error}</p>
        )}
        {exceptionMessage && (
          <ExceptionMessage 
            message={exceptionMessage} 
            onClose={() => setExceptionMessage(null)} 
          />
        )}
      </div>
    </div>
  )
}

