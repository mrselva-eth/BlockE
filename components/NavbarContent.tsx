'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useWallet } from '@/contexts/WalletContext'
import { User, LogOut } from 'lucide-react'

export default function NavbarContent() {
  const { isConnected, address, disconnectWallet, isCorrectNetwork, switchNetwork } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    disconnectWallet()
    setShowDropdown(false)
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-3)}`
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="flex justify-between items-center h-full w-full px-4">
      <div className="flex items-center">
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
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            BlockE User ID
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <User size={24} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-700">
                  <p className="font-semibold">Connected Wallet:</p>
                  <p>{address ? truncateAddress(address) : 'Not connected'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={18} className="mr-2" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

