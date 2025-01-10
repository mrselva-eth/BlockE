'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { format } from 'date-fns'
import { ExternalLink, RefreshCw, Loader, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import debounce from 'lodash/debounce'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasPrice: string
  gasUsed: string
  timeStamp: string
}

interface TransactionHistoryProps {
  address: string
}

const ITEMS_PER_PAGE = 5
const TOTAL_TRANSACTIONS = 20

export default function TransactionHistory({ address }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(`transactions_${address}`, [])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all')
  //const [cache, setCache] = useLocalStorage<{ transactions: Transaction[], timestamp: number } | null>(`transactions_${address}`, null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchTransactions = useCallback(async () => {
    if (Array.isArray(transactions) && transactions.length > 0) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${TOTAL_TRANSACTIONS}&sort=desc&apikey=${apiKey}`
    
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === '1' && Array.isArray(data.result)) {
        const fetchedTransactions = data.result.slice(0, TOTAL_TRANSACTIONS)
        setTransactions(fetchedTransactions)
      } else if (data.status === '0' && data.message === 'No transactions found') {
        setTransactions([])
      } else {
        console.warn('API returned unexpected data:', data)
        setError(data.message || 'No transactions found or API error occurred')
        setTransactions([])
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Failed to fetch transactions. Please try again later.')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [address, transactions, setTransactions])

  const debouncedFetchTransactions = useMemo(
    () => debounce(fetchTransactions, 300),
    [fetchTransactions]
  )

  useEffect(() => {
    //const CACHE_TIME = 5 * 60 * 1000 // 5 minutes
    //if (cache && Date.now() - cache.timestamp < CACHE_TIME) {
    //  setTransactions(cache.transactions)
    //  setIsLoading(false)
    //} else {
      debouncedFetchTransactions()
    //}
  }, [debouncedFetchTransactions])

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return []
    return transactions.filter((tx: Transaction) => {
      if (filter === 'sent') return tx.from.toLowerCase() === address.toLowerCase()
      if (filter === 'received') return tx.to.toLowerCase() === address.toLowerCase()
      return true
    })
  }, [transactions, filter, address])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredTransactions.slice(startIndex, endIndex)
  }, [filteredTransactions, currentPage])

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)

  const handleRefresh = () => {
    setTransactions([])
    fetchTransactions()
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        {error && (
          <div className="text-center text-red-500 mb-4 p-2 bg-red-100 rounded">
            {error}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg h-64 flex items-center justify-center">
        <Loader className="animate-spin text-purple-500" size={24} />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Transaction History</h2>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'sent' | 'received')}
            className="p-2 border rounded"
          >
            <option value="all">All Transactions</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
          <button
            onClick={handleRefresh}
            className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
      
        <>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="min-w-full table-auto">
              <thead className="sticky top-0 bg-white/90 backdrop-blur-sm">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Hash</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">From</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">To</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Value (ETH)</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Gas Price</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Gas Used</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        {tx.hash.slice(0, 8)}...
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                    </td>
                    <td className="px-3 py-2 text-xs">{tx.from.slice(0, 6)}...</td>
                    <td className="px-3 py-2 text-xs">{tx.to.slice(0, 6)}...</td>
                    <td className="px-3 py-2 text-xs">{ethers.formatEther(tx.value)}</td>
                    <td className="px-3 py-2 text-xs">{ethers.formatUnits(tx.gasPrice, 'gwei')}</td>
                    <td className="px-3 py-2 text-xs">{tx.gasUsed}</td>
                    <td className="px-3 py-2 text-xs">{format(new Date(parseInt(tx.timeStamp) * 1000), 'MM/dd/yy HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length > 0 ? (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <p className="text-center mt-4 text-gray-600">No transactions found.</p>
          )}
        </>
      
    </div>
  )
}

