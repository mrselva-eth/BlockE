'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ENSNameProps {
  address: string
  ensName: string | null
}

export default function ENSName({ address, ensName }: ENSNameProps) {
  const [copied, setCopied] = useState(false)

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const displayName = ensName || truncateAddress(address)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent py-4">
          {displayName}
        </h1>
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>
      
      {/* Full address tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 transform -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mb-2">
        <div className="bg-black text-white text-sm rounded-lg py-2 px-4 text-center">
          {address}
        </div>
      </div>
    </div>
  )
}

