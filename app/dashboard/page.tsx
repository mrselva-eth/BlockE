'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import SocialMediaLinks from '@/components/SocialMediaLinks'
import DashboardContent from '@/components/dashboard/DashboardContent'
import { useWallet } from '@/contexts/WalletContext'
import { withWalletProtection } from '@/components/withWalletProtection'
import { useBlockEUID } from '@/hooks/useBlockEUID'
import BlockEUIDList from '@/components/dashboard/BlockEUIDList';
import { ethers } from 'ethers';

function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  const [hasSearchedConnectedAddress, setHasSearchedConnectedAddress] = useState(false)
  const { isConnected, address } = useWallet()
  const { ownedUIDs } = useBlockEUID()

  useEffect(() => {
    const fetchSearchStatus = async () => {
      if (address) {
        try {
          const response = await fetch(`/api/check-preference?address=${address}&preference=connectedAddressSearched`)
          if (response.ok) {
            const data = await response.json()
            setHasSearchedConnectedAddress(data.exists)
          }
        } catch (error) {
          console.error('Error fetching connected address search status:', error)
        }
      }
    }

    fetchSearchStatus()
  }, [address])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return // Don't proceed if the search query is empty

    try {
      // Resolve the address if it's an ENS or BEUID
      let resolvedAddress = searchQuery;
      if (!ethers.isAddress(searchQuery)) {
        try {
          const response = await fetch(`/api/beuid/resolve?uid=${searchQuery}`);
          const data = await response.json();
          if (data.success && data.address) {
            resolvedAddress = data.address;
          } else {
            const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`);
            resolvedAddress = await provider.resolveName(searchQuery) || searchQuery;
          }
        } catch (resolveError) {
          console.error('Error resolving ENS or BEUID:', resolveError)
          // If resolving fails, just use the original search query
        }
      }

      setSearchedAddress(resolvedAddress);

      if (!address) return; // Don't save the search if the user isn't connected

      const saveSearchResponse = await fetch('/api/save-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectedAddress: address,
          searchedAddress: searchQuery,
          resolvedAddress,
          // Placeholder values, replace with actual values
          totalHoldingsETH: 0,
          totalHoldingsUSD: 0,
          gasSpentETH: '0',
          isEns: !ethers.isAddress(searchQuery) && resolvedAddress !== searchQuery,
        }),
      })

      if (!saveSearchResponse.ok) {
        console.error('Failed to save search:', await saveSearchResponse.text())
      }
    } catch (error) {
      console.error('Error during search:', error)
    }
  }

  const handleConnectedAddressSearch = async () => {
    if (address) {
      setSearchQuery(address)
      setSearchedAddress(address)

      if (!hasSearchedConnectedAddress) { // Only save if not already searched
        try {
          const response = await fetch('/api/others', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, action: 'connectedAddressSearch' }),
          })
          if (!response.ok) {
            console.error('Failed to save connected address search:', await response.text())
          } else {
            setHasSearchedConnectedAddress(true) // Update state after successful save
          }
        } catch (error) {
          console.error('Error saving connected address search:', error)
        }
      }
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

