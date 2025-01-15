'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import BlockEUIDContent from '@/components/blocke-uid/BlockEUIDContent'
import ProfileContent from '@/components/blocke-uid/ProfileContent'
import WalletSettingsContent from '@/components/blocke-uid/WalletSettingsContent'
import { Wallet, User, Settings, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ethers } from 'ethers'
import { BLOCKE_UID_CONTRACT_ADDRESS, BLOCKE_UID_ABI } from '@/utils/blockEUIDContract'
import { useTheme } from 'next-themes' // Import useTheme

const pages = [
  { name: 'BlockE UID', icon: Wallet, component: BlockEUIDContent },
  { name: 'Profile', icon: User, component: ProfileContent },
  { name: 'Wallet Settings', icon: Settings, component: WalletSettingsContent },
]

export default function BlockEUIDPage() {
  const { isConnected, address } = useWallet()
  const [activePage, setActivePage] = useState('BlockE UID')
  const [hasUID, setHasUID] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme(); // Get theme and setTheme

  useEffect(() => {
    const checkUID = async () => {
      if (isConnected && address) {
        try {
          const response = await fetch(`/api/verify-beuid?address=${address}`)
          const data = await response.json()
          setHasUID(data.hasUID)
        } catch (error) {
          console.error('Error checking BlockE UID:', error)
          setError('Failed to check BlockE UID status')
        }
      }
    }

    checkUID()
  }, [isConnected, address])

  // Removed the useEffect that sets activePage to 'BlockE UID'

  useEffect(() => {
    // Set theme to 'dark' on component mount
    setTheme('dark');

    return () => {
      // Reset theme to user's preference when leaving the page
      const userTheme = localStorage.getItem('theme') || 'light';
      setTheme(userTheme);
    };
  }, [setTheme]); // Add setTheme to dependency array

  const handleUIDsFetched = (hasUID: boolean) => {
    setHasUID(hasUID);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600">Please connect your wallet to access BlockE UID</p>
      </div>
    )
  }

  const handlePageChange = (pageName: string) => {
    if (pageName === 'Profile' && !hasUID) {
      setError('You need to own a BlockE UID to access the Profile page')
      return
    }
    setError(null)
    setActivePage(pageName)
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
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-sm p-4">
          {pages.map((page) => (
            <button
              key={page.name}
              onClick={() => handlePageChange(page.name)}
              className={`flex items-center w-full p-3 rounded-lg mb-2 transition-all duration-300 ${
                page.name === 'Profile' && !hasUID
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${
                activePage === page.name
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'hover:bg-white/50'
              }`}
              disabled={page.name === 'Profile' && !hasUID}
            >
              <page.icon className="mr-2" size={20} />
              {page.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-grow p-6 flex items-center justify-center">
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {
            <ActiveComponent hasUID={hasUID} onUIDsFetched={handleUIDsFetched} />
          }
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

