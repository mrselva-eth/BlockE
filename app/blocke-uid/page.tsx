'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import BlockEUIDContent from '@/components/blocke-uid/BlockEUIDContent'
import ProfileContent from '@/components/blocke-uid/ProfileContent'
import WalletSettingsContent from '@/components/blocke-uid/WalletSettingsContent'
import { Wallet, User, Settings, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const pages = [
  { name: 'BlockE UID', icon: Wallet, component: BlockEUIDContent },
  { name: 'Profile', icon: User, component: ProfileContent },
  { name: 'Wallet Settings', icon: Settings, component: WalletSettingsContent },
]

export default function BlockEUIDPage() {
  const { isConnected } = useWallet()
  const [activePage, setActivePage] = useState('BlockE UID')
  const router = useRouter()

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600">Please connect your wallet to access BlockE UID</p>
      </div>
    )
  }

  const ActiveComponent = pages.find(page => page.name === activePage)?.component || BlockEUIDContent

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/BEUID.gif"
          alt="BEUID Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          className="opacity-30"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-sm p-4">
          {pages.map((page) => (
            <button
              key={page.name}
              onClick={() => setActivePage(page.name)}
              className={`flex items-center w-full p-3 rounded-lg mb-2 transition-all duration-300 ${
                activePage === page.name
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'hover:bg-white/50'
              }`}
            >
              <page.icon className="mr-2" size={20} />
              {page.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-grow p-6">
          <div className="max-w-4xl mx-auto">
            <ActiveComponent />
          </div>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => router.push('/')}
        className="fixed bottom-6 right-6 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-colors"
      >
        <X size={24} className="text-gray-700" />
      </button>
    </div>
  )
}

