'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Send, Smile, Users, Trash2 } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import dynamic from 'next/dynamic'
import { sendMessage as sendMessageOnChain, sendEmojiReaction } from '@/utils/cw2ContractInteractions'
import { encryptMessage, decryptMessage } from '@/utils/encryption'
import Image from 'next/image'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import ExceptionMessage from './ExceptionMessage'
import { useProfile } from '@/hooks/useProfile'

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
  role?: 'user' | 'assistant'; // Added role property
}

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
        <h3 className="text-xl font-semibold mb-4">Clear Chat History</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to clear all messages? This action cannot be undone.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ChatInterface({ selectedContact, selectedGroup, isGroup }: ChatInterfaceProps) {
  const { address } = useWallet()
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exceptionMessage, setExceptionMessage] = useState<string | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const { profileData } = useProfile(address) // Access profile data

  const selectedEntity = isGroup ? selectedGroup : selectedContact
  const selectedAddress = isGroup ? selectedGroup?.groupName : selectedContact?.contactAddress

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const fetchMessages = useCallback(async () => {
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
  }, [address, selectedAddress, isGroup, selectedEntity])

  useEffect(() => {
    if (selectedEntity && address) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedEntity, address, fetchMessages])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedEntity || !address) return

    setIsLoading(true)
    setError(null)

    try {
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
          role: 'user', // Added role property
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Call sendMessageOnChain AFTER successfully saving the message
      await sendMessageOnChain()

      setMessage('')
      await fetchMessages()
      
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

  const handleClearChat = () => {
    setShowDeleteConfirmation(true)
  }

  const confirmClearChat = async () => {
    setMessages([])
    setShowDeleteConfirmation(false)
    // Here you would typically also clear the messages from your backend
  }

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date)
    if (isToday(messageDate)) {
      return 'Today'
    } else if (isYesterday(messageDate)) {
      return 'Yesterday'
    }
    return format(messageDate, 'MMMM d, yyyy')
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
    <div className="flex flex-col h-[calc(100vh-4rem)] relative">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/chatback.gif"
          alt="Chat Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-80"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="sticky top-0 p-3 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-0" ref={messageContainerRef}>
          {messages.reduce((acc: JSX.Element[], message, index) => {
            const messageDate = new Date(message.createdAt)
            const previousMessage = messages[index - 1]
            const showDateSeparator = !previousMessage || 
              !isSameDay(messageDate, new Date(previousMessage.createdAt))

            if (showDateSeparator) {
              acc.push(
                <div key={`date-${message._id}`} className="flex items-center justify-center my-4">
                  <div className="bg-black/5 backdrop-blur-sm px-4 py-1 rounded-full">
                    <span className="text-sm font-medium text-black">
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                </div>
              )
            }

            const isSender = message.senderAddress.toLowerCase() === address?.toLowerCase()
            acc.push(
              <div
                key={message._id}
                className={`flex items-start gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
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
                      {message.senderAddress.slice(0, 6)}...{message.senderAddress.slice(-4)}
                    </p>
                  )}
                  <p className="break-words whitespace-pre-wrap">{message.decryptedMessage}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {format(new Date(message.createdAt), 'HH:mm')}
                </span>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={profileData?.profileImage || "/user.png"} // Use profile image or default
                      alt="User"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            )
            return acc
          }, [])}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 p-3 bg-white/50 backdrop-blur-sm border-t border-gray-200">
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
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={handleClearChat}
          className="absolute left-4 bottom-20 p-2 bg-white/80 hover:bg-white/90 rounded-full shadow-lg transition-colors"
        >
          <Trash2 size={20} className="text-gray-600" />
        </button>
      </div>

      {error && (
        <p className="text-red-500 mt-2 text-sm">{error}</p>
      )}
      {exceptionMessage && (
        <ExceptionMessage 
          message={exceptionMessage} 
          onClose={() => setExceptionMessage(null)} 
        />
      )}
      {showDeleteConfirmation && (
        <DeleteConfirmation
          onConfirm={confirmClearChat}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
    </div>
  )
}

