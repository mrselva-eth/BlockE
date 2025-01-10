'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { format } from 'date-fns'
import { ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import Loader from '../Loader'

interface TokenTransfer {
  hash: string
  from: string
  to: string
  tokenName: string
  tokenSymbol: string
  value: string
  tokenDecimal: string
  timeStamp: string
  tokenPrice?: number // Optional token price in USD
}

const ITEMS_PER_PAGE = 5 // Set to 5 transactions per page

export default function TokenTransferHistory({ address }: { address: string }) {
  const [transfers, setTransfers] = useLocalStorage<TokenTransfer[]>(`token_transfers_${address}`, [])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTokenPrices = async (tokenAddresses: (string | undefined)[]) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddresses.filter(Boolean).join(',')}&vs_currencies=usd`
      )
      if (!response.ok) throw new Error('Failed to fetch token prices')
      return await response.json()
    } catch (error) {
      console.error('Error fetching token prices:', error)
      return {}
    }
  }

  const fetchTokenTransfers = useCallback(async () => {
    if (Array.isArray(transfers) && transfers.length > 0) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
      const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`
    
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === '1' && Array.isArray(data.result)) {
        const transfersData = data.result.slice(0, 100)
        
        // Get unique token addresses
        const uniqueTokenAddresses = [...new Set(transfersData.map((t: any) => t.contractAddress))] as (string | undefined)[]
        
        // Fetch token prices
        const tokenPrices = await fetchTokenPrices(uniqueTokenAddresses)
        
        // Add price information to transfers
        const transfersWithPrices = transfersData.map((transfer: any) => ({
          ...transfer,
          tokenPrice: tokenPrices[transfer.contractAddress.toLowerCase()]?.usd
        }))

        setTransfers(transfersWithPrices)
        setTotalPages(Math.ceil(transfersWithPrices.length / ITEMS_PER_PAGE))
      } else {
        console.warn('API returned unexpected data:', data)
        setError(data.message || 'No transfers found or API error occurred')
        setTransfers([])
      }
    } catch (err) {
      console.error('Error fetching transfers:', err)
      setError('Failed to fetch transfers. Please try again later.')
      setTransfers([])
    } finally {
      setIsLoading(false)
    }
  }, [address, transfers, setTransfers])

  useEffect(() => {
    fetchTokenTransfers()
  }, [fetchTokenTransfers])

  const paginatedTransfers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return transfers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [transfers, currentPage])

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

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Token Transfer History
        </h2>
        <button
          onClick={() => {
            setTransfers([])
            fetchTokenTransfers()
          }}
          className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
          title="Refresh transfers"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedTransfers.map((transfer) => {
              const amount = ethers.formatUnits(transfer.value, parseInt(transfer.tokenDecimal))
              const value = transfer.tokenPrice 
                ? (parseFloat(amount) * transfer.tokenPrice).toFixed(2)
                : null

              return (
                <tr key={transfer.hash} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {transfer.tokenName} ({transfer.tokenSymbol})
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {parseFloat(amount).toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {value ? `$${value}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(parseInt(transfer.timeStamp) * 1000), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={`https://etherscan.io/tx/${transfer.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 inline-flex items-center"
                    >
                      View
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {transfers.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
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

