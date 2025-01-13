'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useWallet } from '@/contexts/WalletContext'
import { useAIBalance } from '@/hooks/useAIBalance'
import { ethers } from 'ethers'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'
import { BE_AI_CONTRACT_ADDRESS, BE_AI_CONTRACT_ABI } from '@/utils/beAiContractABI'
import TransactionHistory from './TransactionHistory'
import TransactionRejectedMessage from '../TransactionRejectedMessage'
import TransactionStatus from '../TransactionStatus'

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  timestamp: string;
  transactionHash: string;
}

type Mode = 'deposit' | 'withdraw'
type TransactionStatus = 'idle' | 'approving' | 'pending' | 'success' | 'error'

export default function TokenManagementSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('deposit')
  const [amount, setAmount] = useState<string>('0')
  const [status, setStatus] = useState<TransactionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [showTransactionRejected, setShowTransactionRejected] = useState(false)
  const { address } = useWallet()
  const { balance, setBalance, refreshBalance } = useAIBalance()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showCornerNotification, setShowCornerNotification] = useState(false)
  const [currentPage, setCurrentPage] = useState(1); // Added state for pagination


  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientX > window.innerWidth - 50) {
        setIsOpen(true)
      } else if (event.clientX < window.innerWidth - 300) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (address) {
        refreshBalance()
      }
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(intervalId)
  }, [address, refreshBalance])

  const handleTransaction = async () => {
    if (!window.ethereum || !address) return
    setError(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const tokenContract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, signer)
      const aiContract = new ethers.Contract(BE_AI_CONTRACT_ADDRESS, BE_AI_CONTRACT_ABI, signer)

      setIsProcessing(true)
      if (mode === 'deposit') {
        setStatus('approving')
        const approveTx = await tokenContract.approve(
          BE_AI_CONTRACT_ADDRESS,
          ethers.parseEther(amount)
        )
        await approveTx.wait()

        setStatus('pending')
        const depositTx = await aiContract.deposit(ethers.parseEther(amount))
        await depositTx.wait()

        await fetch('/api/beait', { // Updated API endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: address!.toLowerCase(),
            type: mode,
            amount: parseFloat(amount),
            txHash: depositTx.hash,
          }),
        })

        const response = await fetch('/api/ai-balance/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: address,
            balance: Number(amount),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to sync balance with MongoDB')
        }

        const data = await response.json()
        setBalance(data.balance)
      } else {
        setStatus('pending')
        const withdrawTx = await aiContract.withdraw(ethers.parseEther(amount))
        await withdrawTx.wait()

        await fetch('/api/beait', { // Updated API endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: address!.toLowerCase(),
            type: mode,
            amount: parseFloat(amount),
            txHash: withdrawTx.hash,
          }),
        })

        const response = await fetch('/api/ai-balance/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: address,
            balance: -Number(amount),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to sync balance with MongoDB')
        }

        const data = await response.json()
        setBalance(data.balance)
      }

      setStatus('success')
      setAmount('0')
      setIsProcessing(false)
      setIsCompleted(true)
      setTimeout(() => {
        setIsCompleted(false)
        setShowCornerNotification(true)
      }, 3000)

      // Hide corner notification after 3 seconds
      setTimeout(() => {
        setShowCornerNotification(false)
      }, 6000)

    } catch (error: any) {
      console.error('Transaction failed:', error)
      setStatus('error')
      setIsProcessing(false)
      if (error.code === 4001) {
        setShowTransactionRejected(true)
      } else {
        setError(error.message || 'Transaction failed. Please try again.')
      }
    } finally {
      await refreshBalance()
      setTimeout(() => {
        setStatus('idle')
        setError(null)
      }, 5000)
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'approving':
        return 'Approving token spend...'
      case 'pending':
        return `${mode === 'deposit' ? 'Depositing' : 'Withdrawing'}...`
      case 'success':
        return 'Transaction successful!'
      case 'error':
        return error || 'Transaction failed'
      default:
        return mode === 'deposit' ? 'Deposit' : 'Withdraw'
    }
  }

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/beait?address=${address}&page=${currentPage}&limit=2`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // ... process data
    } catch (err) {
      console.error("Error fetching transactions:", err);
      // ... handle error
    }
  }, [address, currentPage]);


  return (
    <>
      {!isOpen && (
        <button
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
          onMouseEnter={() => setIsOpen(true)}
        >
          <ChevronRight size={24} className="animate-pulse" />
          <span className="sr-only">Open Token Management</span>
        </button>
      )}

      {balance === 0 && !isOpen && (
        <div className="fixed right-16 top-1/2 transform -translate-y-1/2 z-40 bg-white/80 rounded-lg p-2 shadow-lg animate-bounce backdrop-blur-sm">
          <p className="text-sm font-medium text-gray-800 flex items-center">
            Deposit BE Tokens <ArrowRight className="ml-2" size={16} />
          </p>
        </div>
      )}

      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-gradient-to-br from-indigo-50 to-purple-100 shadow-lg transform transition-transform duration-300 ease-in-out z-30 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2 pb-2 border-b-2 border-indigo-500">BE Token Management</h2>

          <div className="flex items-center gap-2 mb-6">
            <Image
              src="/blocke-logo.png"
              alt="BE Token"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-xl font-bold">{balance} BE</span>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                mode === 'deposit'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
              onClick={() => setMode('deposit')}
            >
              Deposit
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                mode === 'withdraw'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
              onClick={() => setMode('withdraw')}
            >
              Withdraw
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to {mode}
            </label>
            <input
              type="number"
              min="0"
              max={mode === 'withdraw' ? balance : 1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-purple-200 px-4 py-2 mb-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="range"
              min="0"
              max={mode === 'withdraw' ? balance : 1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(Number(amount) / (mode === 'withdraw' ? balance : 1000)) * 100}%, #E5E7EB ${(Number(amount) / (mode === 'withdraw' ? balance : 1000)) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            {mode === 'deposit' && (
              <p className="text-xs text-gray-500 mt-2">Max deposit: 1000 BE</p>
            )}
          </div>

          <button
            className="btn-23 w-full mb-4"
            onClick={handleTransaction}
            disabled={status !== 'idle' || !Number(amount) || (mode === 'withdraw' && Number(amount) > balance)}
          >
            <span>{getStatusMessage()}</span>
          </button>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <TransactionHistory />
          </div>
        </div>
      </div>

      {showTransactionRejected && (
        <TransactionRejectedMessage onClose={() => setShowTransactionRejected(false)} />
      )}

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
    </>
  )
}

