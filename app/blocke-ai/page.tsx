'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import Image from 'next/image'
import ChatInterface from '@/components/ai/ChatInterface'
import TokenManagementSidebar from '@/components/ai/TokenManagementSidebar'
import { formatDate } from '@/utils/formatDate'
import { useAIBalance } from '@/hooks/useAIBalance'
import Sidebar from '@/components/Sidebar'
import { withWalletProtection } from '@/components/withWalletProtection'

function BlockEAIPage() {
  const { isConnected, address } = useWallet()
  const { balance, refreshBalance } = useAIBalance()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Initial fetch
    refreshBalance()
    
    // Set up polling interval
    const intervalId = setInterval(refreshBalance, 3000)
    
    // Cleanup
    return () => clearInterval(intervalId)
  }, [refreshBalance])

  // if (!isConnected) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
  //       <p className="text-lg text-gray-600">Please connect your wallet to access BlockE AI</p>
  //     </div>
  //   )
  // }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] relative">
      {/* Background GIF */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/AIBOT.png"
          alt="AI Bot Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          className="opacity-50"
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
            <div className="rounded-lg p-4 bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-sm text-white shadow-lg">
              <div className="text-3xl font-bold">{balance} BE</div>
              <div className="text-sm opacity-90">BlockE AI Deposit Balance</div>
            </div>

            {/* Time - Right Side */}
            <div className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-md">
              <div className="text-sm text-gray-800 font-medium">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Centered Chat Interface */}
          <div className="flex-grow flex justify-center items-center px-4">
            <div className="w-[800px] h-[600px] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200 relative">
              <ChatInterface />
            </div>
          </div>

          {/* Add TokenManagementSidebar here */}
          <TokenManagementSidebar />
        </div>

      </div>
    </div>
  )
}

export default withWalletProtection(BlockEAIPage)

