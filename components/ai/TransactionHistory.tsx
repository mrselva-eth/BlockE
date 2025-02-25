'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { useWallet } from '@/contexts/WalletContext'
import { ChevronLeft, ChevronRight, ExternalLink, AlertCircle } from 'lucide-react'

interface Transaction {
  _id: string
  address: string
  type: 'deposit' | 'withdraw'
  amount: number
  transactionHash: string // Use transactionHash instead of txHash
  timestamp: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { address } = useWallet()

  const fetchTransactions = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/beait?address=${address}&page=${currentPage}&limit=2`) // Updated API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setTransactions(data.actions || [])
      setTotalPages(Math.max(1, Math.ceil((data.totalCount || 0) / 2)))
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setError('Failed to load transactions. Please try again.')
      setTransactions([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [address, currentPage])

  useEffect(() => {
    fetchTransactions()
  }, [address, currentPage, fetchTransactions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="text-gray-400 mb-2">
          <AlertCircle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">No transaction history available</p>
        <p className="text-sm text-gray-400 mt-1">
          Your recent transactions will appear here
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={`${tx.transactionHash}-${tx.timestamp}`}
            className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tx.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                </span>
                <span className="font-medium">
                  {tx.amount} BE
                </span>
              </div>
              <a
                href={`https://polygonscan.com/tx/${tx.transactionHash}`} // Use transactionHash
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink size={16} />
              </a>
            </div>
            <div className="text-xs text-gray-500">
              {format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm:ss')}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

