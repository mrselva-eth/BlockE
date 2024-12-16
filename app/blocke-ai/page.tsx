'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import Image from 'next/image'
import ChatInterface from '@/components/ai/ChatInterface'
import TokenManagementSidebar from '@/components/ai/TokenManagementSidebar'
import { formatDate } from '@/utils/formatDate'
import { useAIBalance } from '@/hooks/useAIBalance'
import Sidebar from '@/components/Sidebar'
import SocialMediaLinks from '@/components/SocialMediaLinks'

export default function BlockEAIPage() {
  const { isConnected, address } = useWallet()
  const { balance } = useAIBalance()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600">Please connect your wallet to access BlockE AI</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] relative">
      {/* Background GIF */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/AIBOT.gif"
          alt="AI Bot Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          className="!opacity-100"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-grow">
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col relative">
          {/* Top Bar with Balance and Time */}
          <div className="absolute top-4 w-full px-4 flex justify-between items-start">
            {/* Balance - Left Side */}
            <div className="rounded-lg p-4 bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-sm text-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="text-3xl font-bold">{balance} BE</div>
              <div className="text-sm opacity-90">BlockE AI Deposited Balance</div>
            </div>

            {/* Time - Right Side */}
            <div className="p-2 rounded-lg bg-white/80 backdrop-blur-sm">
              <div className="text-sm text-gray-800">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Centered Chat Interface */}
          <div className="flex-grow flex justify-center items-center px-4">
            <div className="w-[800px] h-[600px] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
              <ChatInterface />
            </div>
          </div>

          {/* Add TokenManagementSidebar here */}
          <TokenManagementSidebar />
        </div>

        <SocialMediaLinks />
      </div>
    </div>
  )
}

