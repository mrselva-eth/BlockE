'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ExternalLink, Clock } from 'lucide-react'
import Image from 'next/image'

interface Transaction {
  hash: string
  timeStamp: string
}

export default function TransactionDetails({ address }: { address: string }) {
  const [firstTx, setFirstTx] = useState<Transaction | null>(null)
  const [lastTx, setLastTx] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`

      try {
        const response = await fetch(url)
        const data = await response.json()
        if (data.status === '1' && data.result.length > 0) {
          setFirstTx(data.result[0])
          setLastTx(data.result[data.result.length - 1])
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [address])

  const formatDate = (timestamp: string) => {
    return format(new Date(parseInt(timestamp) * 1000), 'MMM d, yyyy HH:mm:ss')
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/transactionhistory.gif"
          alt="Transaction History Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-30"
        />
      </div>
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Transaction History
        </h2>

        <div className="space-y-6">
          {firstTx && (
            <div className="group">
              <h3 className="text-lg font-medium text-gray-700 mb-2">First Transaction</h3>
              <p className="text-sm text-gray-600 mb-2">{formatDate(firstTx.timeStamp)}</p>
              <a
                href={`https://etherscan.io/tx/${firstTx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 transition-colors group-hover:underline"
              >
                View on Etherscan
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          )}

          {lastTx && (
            <div className="group">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Last Transaction</h3>
              <p className="text-sm text-gray-600 mb-2">{formatDate(lastTx.timeStamp)}</p>
              <a
                href={`https://etherscan.io/tx/${lastTx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 transition-colors group-hover:underline"
              >
                View on Etherscan
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

