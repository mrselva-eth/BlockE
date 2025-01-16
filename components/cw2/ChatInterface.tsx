'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Send, Smile, Users } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import dynamic from 'next/dynamic'
import { sendMessage as sendMessageOnChain, sendEmojiReaction } from '@/utils/cw2ContractInteractions'
import { encryptMessage, decryptMessage } from '@/utils/encryption'
import Image from 'next/image'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import ExceptionMessage from './ExceptionMessage'
import { useProfile } from '@/hooks/useProfile'
import { BE_TOKEN_ABI, BE_TOKEN_ADDRESS } from '@/utils/beTokenABI';
import { ethers } from 'ethers';
import TransactionStatus from '../TransactionStatus';

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
role?: 'user' | 'assistant';
}


const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedContact, selectedGroup, isGroup }: ChatInterfaceProps) => {
const { address } = useWallet()
const [message, setMessage] = useState('')
const [showEmojiPicker, setShowEmojiPicker] = useState(false)
const [messages, setMessages] = useState<Message[]>([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [exceptionMessage, setExceptionMessage] = useState<string | null>(null)
const messagesEndRef = useRef<HTMLDivElement>(null)
const messageContainerRef = useRef<HTMLDivElement>(null)
const { profileData } = useProfile(address)
const [beTokenBalance, setBeTokenBalance] = useState<number>(0);
const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
const [newMessageReceived, setNewMessageReceived] = useState(false);
const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  const fetchBeTokenBalance = async () => {
    if (address) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, provider);
        const balance = await contract.balanceOf(address);
        setBeTokenBalance(Number(ethers.formatUnits(balance, 18)));
      } catch (error) {
        console.error('Error fetching BE token balance:', error);
      }
    }
  };

  fetchBeTokenBalance();
}, [address]);


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

useEffect(() => {
  if (newMessageReceived && audioRef.current) {
    audioRef.current.play().catch(error => {
      console.error("Failed to play notification sound:", error);
    });
    setNewMessageReceived(false);
  }
}, [newMessageReceived]);

useEffect(() => {
  if (selectedEntity && address) {
    const lastMessage = messages[messages.length - 1];

    const checkNewMessages = async () => {
      const response = await fetch(
        `/api/messages?senderAddress=${address}&receiverAddress=${selectedAddress}&isGroup=${isGroup}`
      );
      if (!response.ok) {
        console.error('Failed to fetch messages for new message check');
        return;
      }

      const fetchedMessages = await response.json();
      if (
        fetchedMessages.length > 0 &&
        (!lastMessage || fetchedMessages[fetchedMessages.length - 1]._id !== lastMessage._id)
      ) {
        setNewMessageReceived(true); // Set newMessageReceived to true when a new message arrives
        fetchMessages(); // Fetch and display the new messages
      }
    };

    const interval = setInterval(checkNewMessages, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }
}, [messages, selectedEntity, address, selectedAddress, isGroup, fetchMessages]);

const handleSendMessage = async () => {
 if (!message.trim() || !selectedEntity || !address) return

 // Check BE token balance before sending
 if (beTokenBalance < 1) {
   setExceptionMessage('Insufficient BE tokens. Please deposit more to send messages.');
   return;
 }

 setIsLoading(true);
 setError(null);
 setTransactionStatus('pending'); // Set transaction status to pending

 try {
   const encryptedMsg = await encryptMessage(message, selectedAddress!);

   // Call sendMessageOnChain FIRST
   let txHash: string;
   try {
     txHash = await sendMessageOnChain();
     setBeTokenBalance(prevBalance => prevBalance - 1);
   } catch (error) {
     console.error('Failed to send message on-chain:', error);
     setTransactionStatus('error'); // Set transaction status to error
     setExceptionMessage('Failed to send message on-chain. Please try again.');
     return;
   }

   // Only save the message to the database AFTER the transaction is successful
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
       role: 'user',
     }),
   });

   if (!response.ok) {
     throw new Error('Failed to send message');
   }

   setTransactionStatus('success'); // Set transaction status to success
   setMessage('');
   await fetchMessages();

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
   console.error('Failed to send message:', err);
   setTransactionStatus('error'); // Set transaction status to error
   if (err.code === 4001) {
     setExceptionMessage('Transaction rejected. Please try again.');
   } else {
     setError(err.message || 'Failed to send message. Please try again.');
   }
 } finally {
   setIsLoading(false);
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
                   src={profileData?.profileImage || "/user.png"}
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
   {transactionStatus !== 'idle' && (
        <TransactionStatus
          isProcessing={transactionStatus === 'pending'}
          isCompleted={transactionStatus === 'success'}
          message={
            transactionStatus === 'pending'
              ? 'Sending message...'
              : transactionStatus === 'success'
              ? 'Message sent!'
              : 'Message failed to send.'
          }
          onClose={() => setTransactionStatus('idle')}
          isCornerNotification
        />
      )}
     <audio ref={audioRef} src="/notification.mp3" preload="auto" />
 </div>
)
}

export default ChatInterface;

