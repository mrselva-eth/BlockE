import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'

export function useAIBalance() {
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { address } = useWallet()

  const fetchBalance = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/ai-balance?address=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch balance from API')
      }
      const data = await response.json()
      
      if (data.balance !== undefined) {
        setBalance(data.balance)
        console.log(`Balance fetched from MongoDB: ${data.balance} BE`)
      } else {
        console.error('Failed to fetch balance from MongoDB')
        throw new Error('Invalid balance data received')
      }
      setError(null)
    } catch (error) {
      console.error('Error fetching AI balance:', error)
      setError('Failed to fetch balance. Please try again later.')
      setBalance(0) // Set balance to 0 when there's an error
    }
  }, [address, setBalance])

  const deductToken = useCallback(async () => {
    if (!address) return
    try {
      const response = await fetch('/api/ai-balance/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deduct token')
      }
      const data = await response.json()
      setBalance(data.newBalance)
      console.log(`Token deducted. New balance: ${data.newBalance} BE`)
      setError(null)
    } catch (error) {
      console.error('Failed to deduct token:', error)
      setError('Failed to deduct token. Please try again later.')
      throw error
    }
  }, [address, setBalance])

  const refreshBalance = useCallback(async () => {
    await fetchBalance()
  }, [fetchBalance])

  useEffect(() => {
    fetchBalance().catch(error => {
      console.error('Error in useEffect:', error)
      setError('Failed to fetch initial balance. Please try again later.')
    })
  }, [fetchBalance])

  return { balance, setBalance, deductToken, refreshBalance, fetchBalance, error }
}

