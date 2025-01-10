'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import Loader from '../Loader'

interface NFT {
  id: string
  name: string
  description: string
  image: string
  collectionName: string
  floorPrice?: number
  lastSalePrice?: number
  openseaUrl?: string
}

interface NFTHoldingsProps {
  address: string
}

const ITEMS_PER_PAGE = 4 // 4 NFTs per row

export default function NFTHoldings({ address }: NFTHoldingsProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchNFTs = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/nft-holdings?address=${address}`)
        if (!response.ok) {
          throw new Error('Failed to fetch NFTs')
        }
        const data = await response.json()
        
        if (data.success) {
          setNfts(data.nfts)
        } else {
          throw new Error(data.error || 'Failed to fetch NFT holdings')
        }
      } catch (err) {
        console.error('Error fetching NFT holdings:', err)
        setError('Failed to fetch NFT holdings. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNFTs()
  }, [address])

  const totalPages = Math.ceil(nfts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedNFTs = nfts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg h-64 flex items-center justify-center">
        <Loader size={24} className="text-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg">
        <div className="text-center text-red-500 mb-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg">
        <div className="text-center text-gray-600">No NFTs found for this address.</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        NFT Holdings
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedNFTs.map((nft) => (
          <div
            key={nft.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={nft.image}
                alt={nft.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">{nft.name}</h3>
              <p className="text-sm text-gray-600 mb-2 truncate">{nft.collectionName}</p>
              {nft.floorPrice && (
                <p className="text-sm font-medium text-gray-800">
                  Floor: {nft.floorPrice.toFixed(3)} ETH
                </p>
              )}
              {nft.lastSalePrice && (
                <p className="text-sm text-gray-600">
                  Last sale: {nft.lastSalePrice.toFixed(3)} ETH
                </p>
              )}
              {nft.openseaUrl && (
                <a
                  href={nft.openseaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
                >
                  View on OpenSea
                  <ExternalLink size={14} className="ml-1" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white text-purple-600 disabled:text-gray-400 disabled:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white text-purple-600 disabled:text-gray-400 disabled:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

