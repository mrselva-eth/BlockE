'use client'

import Image from 'next/image'
import { useWallet } from '@/contexts/WalletContext'

export default function NavbarContent() {
  const { isConnected } = useWallet()

  return (
    <div className="flex justify-between items-center h-full w-full">
      <div className="flex items-center pl-2">
        <div className="relative h-10 w-10">
          <Image
            src="/blocke-logo.png"
            alt="BlockE Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="ml-2 text-xl sm:text-2xl font-bold text-gray-800">BlockE</h1>
      </div>
      {isConnected && (
        <div className="flex items-center gap-2 pr-2">
          <button className="px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            BlockE User ID
          </button>
        </div>
      )}
    </div>
  )
}

