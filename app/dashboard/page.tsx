'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import SocialMediaLinks from '@/components/SocialMediaLinks'
import DashboardContent from '@/components/dashboard/DashboardContent'
import { useWallet } from '@/contexts/WalletContext'

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  const { isConnected } = useWallet()

  const truncateAddress = (address: string | null) => {
    if (!address) return ''
    if (address.includes('.eth')) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchedAddress(searchQuery)
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600">Please connect your wallet to access the Dashboard</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] relative">
      <Sidebar />
      <div className="flex-grow p-6 overflow-auto max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent py-4">
          {truncateAddress(searchedAddress || '')}
        </h1>
        <div className="relative mb-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search by ENS or Ethereum address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border-2 border-purple-500 rounded-full focus:outline-none focus:border-pink-500 transition-colors"
            />
            <button type="submit" className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
          </form>
        </div>
        <DashboardContent address={searchedAddress} />
      </div>
      <SocialMediaLinks />
      <div className="fixed inset-0 -z-10">
        <Image
          src="/dashboard.gif"
          alt="Dashboard Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </div>
    </div>
  )
}

