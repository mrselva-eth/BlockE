import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { deposit, withdraw } from '@/utils/cw2ContractInteractions'
import { useWallet } from '@/contexts/WalletContext'
import { format } from 'date-fns'
import TransactionStatus from '@/components/TransactionStatus'

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  timestamp: string;
  txHash: string;
}

interface DepositWithdrawModalProps {
  onClose: () => void
}

export default function DepositWithdrawModal({ onClose }: DepositWithdrawModalProps) {
  const { address } = useWallet()
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showCornerNotification, setShowCornerNotification] = useState(false)

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/cw2?address=${address}&page=${currentPage}&limit=2`)
      const data = await response.json()
      if (data.success) {
        setTransactions(data.actions)
        setTotalPages(Math.ceil(data.totalCount / 2))
      } else {
        console.error('Failed to fetch CW2 transactions:', data.error)
        setError('Failed to fetch transactions. Please try again later.')
      }
    } catch (err) {
      console.error('Failed to fetch CW2 transactions:', err)
      setError('Failed to fetch transactions. Please try again later.')
    }
  }, [address, currentPage])

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, fetchTransactions])

  const handleTransaction = async () => {
    setIsLoading(true)
    setError(null)
    setIsProcessing(true)
    try {
      let txHash: string;
      if (mode === 'deposit') {
        txHash = await deposit(amount)
      } else {
        txHash = await withdraw(amount)
      }

      const response = await fetch('/api/cw2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address!.toLowerCase(),
          type: mode,
          amount: parseFloat(amount),
          txHash: txHash,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to record transaction')
      }

      setIsProcessing(false)
      setIsCompleted(true)
      setTimeout(() => {
        setIsCompleted(false)
        setShowCornerNotification(true)
      }, 3000)
      await fetchTransactions()
      setAmount('')
    } catch (err: any) {
      console.error(`Failed to ${mode}:`, err)
      setError(err.message || `Failed to ${mode}. Please try again.`)
      setIsProcessing(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Deposit / Withdraw</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 rounded-l-lg transition-colors ${
              mode === 'deposit'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100'
            }`}
            onClick={() => setMode('deposit')}
          >
            Deposit
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg transition-colors ${
              mode === 'withdraw'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100'
            }`}
            onClick={() => setMode('withdraw')}
          >
            Withdraw
          </button>
        </div>
        <div className="mb-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-2"
            placeholder="Enter amount"
          />
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${(Number(amount) / 100) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>
        <button
          onClick={handleTransaction}
          disabled={isLoading}
          className="w-full btn-23 mb-6"
        >
          <span>{isLoading ? 'Processing...' : mode === 'deposit' ? 'Deposit' : 'Withdraw'}</span>
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="p-3 rounded-lg border border-gray-200 hover:border-purple-500 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="mt-1 text-lg font-semibold">{tx.amount} BE</div>
                <a
                  href={`https://polygonscan.com/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:text-purple-700 mt-1 inline-block"
                >
                  View on PolygonScan
                </a>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
        {(isProcessing || isCompleted) && !showCornerNotification && (
          <TransactionStatus
            isProcessing={isProcessing}
            isCompleted={isCompleted}
            onClose={() => {
              setIsProcessing(false)
              setIsCompleted(false)
              setShowCornerNotification(true)
            }}
          />
        )}
        {showCornerNotification && (
          <TransactionStatus
            isProcessing={false}
            isCompleted={true}
            onClose={() => setShowCornerNotification(false)}
            isCornerNotification={true}
          />
        )}
      </div>
    </div>
  )
}

