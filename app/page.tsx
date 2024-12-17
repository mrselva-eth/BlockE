'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Sidebar from '../components/Sidebar'
import WalletModal from '../components/WalletModal'
import SocialMediaLinks from '../components/SocialMediaLinks'
import { useWallet } from '@/contexts/WalletContext'

export default function Home() {
  const { isConnected, setShowWalletModal } = useWallet()

  const handleConnectWallet = () => {
    setShowWalletModal(true)
  }

  useEffect(() => {
    if (!isConnected) {
      // Reset any necessary state or redirect to home page
      // This effect will run when the user disconnects their wallet
    }
  }, [isConnected])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {isConnected && <Sidebar />}
      <main className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="mb-8">
          <Image
            src="/blocke-logo.png"
            alt="BlockE Logo"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-800 font-space-grotesk">
          Welcome to BlockE
        </h1>
        <p className="text-xl sm:text-2xl mb-8 text-gray-600">
          Your gateway to the world of Web 3.0
        </p>
        <p className="text-lg mb-8 text-gray-700 max-w-2xl mx-auto">
          Explore decentralized finance, NFTs, and blockchain analytics all in one place. 
          BlockE provides cutting-edge tools and insights for the modern crypto enthusiast.
        </p>
        {!isConnected && (
          <button 
            onClick={handleConnectWallet}
            className="wallet-connect-btn"
          >
            Connect Wallet
          </button>
        )}
      </main>
      <WalletModal />
      <SocialMediaLinks />
    </div>
  )
}

