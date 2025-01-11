'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import SocialMediaLinks from '@/components/SocialMediaLinks'
import DashboardContent from '@/components/dashboard/DashboardContent'
import { useWallet } from '@/contexts/WalletContext'
import { withWalletProtection } from '@/components/withWalletProtection'
import { useBlockEUID } from '@/hooks/useBlockEUID'
import BlockEUIDList from '@/components/dashboard/BlockEUIDList';

function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  const { isConnected, address } = useWallet()
  const { ownedUIDs } = useBlockEUID()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/beuid/resolve?uid=${searchQuery}`)
      const data = await response.json()
      
      if (data.success && data.address) {
        setSearchedAddress(data.address)
      } else {
        setSearchedAddress(searchQuery)
      }
    } catch (error) {
      console.error('Error resolving BE UID:', error)
      setSearchedAddress(searchQuery)
    }
  }

  const handleConnectedAddressSearch = () => {
    if (address) {
      setSearchQuery(address)
      setSearchedAddress(address)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 p-2 overflow-y-auto"> {/* Added overflow-y-auto to the main content area */}
        <div className="h-full">
          <div className="grid grid-cols-12 gap-2 h-full">
            {/* Left Column - BlockE UIDs */}
            <div className="col-span-2 h-full">
              <BlockEUIDList address={address || ''} /> {/* Pass address prop */}
            </div>

            {/* Right Column - Search and Content */}
            <div className="col-span-10 flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder="Search by ENS, Ethereum address, or BE UID"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 px-4 py-1 pl-9 pr-4 text-sm text-gray-700 bg-white border-2 border-purple-500 rounded-full focus:outline-none focus:border-pink-500 transition-colors"
                    />
                    <button type="submit" className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="w-4 h-4 text-gray-400" />
                    </button>
                  </form>
                </div>
                <button
                  onClick={handleConnectedAddressSearch}
                  className="px-3 h-9 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center whitespace-nowrap"
                >
                  <Search className="mr-1" size={14} />
                  Search Connected Address
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <DashboardContent address={searchedAddress} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <SocialMediaLinks />
      <div className="fixed inset-0 -z-10"> {/* Added fixed class to fix the background */}
        <Image
          src="/dashboard.jpg"
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

export default withWalletProtection(DashboardPage)

