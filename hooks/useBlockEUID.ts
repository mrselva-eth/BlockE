import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { debounce } from 'lodash'

interface BEUID {
  uid: string
  formattedUid: string
  digits: number
  address: string  // Add this line
}

export function useBlockEUID() {
  const { address } = useWallet()
  const [ownedUIDs, setOwnedUIDs] = useState<BEUID[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOwnedUIDs = useCallback(async (address: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/beuid?address=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch BEUIDs')
      }
      const data = await response.json()
      if (data.success) {
        setOwnedUIDs(data.ownedUIDs)
      } else {
        setOwnedUIDs([])
      }
    } catch (error) {
      console.error('Error fetching owned UIDs:', error)
      setError('Failed to fetch owned UIDs. Please try again later.')
      setOwnedUIDs([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedFetchOwnedUIDs = useCallback(
    debounce((address: string) => {
      fetchOwnedUIDs(address)
    }, 300),
    [fetchOwnedUIDs]
  )

  useEffect(() => {
    if (address) {
      debouncedFetchOwnedUIDs(address)
    }
  }, [address, debouncedFetchOwnedUIDs])

  const refetchUIDs = useCallback(() => {
    if (address) {
      fetchOwnedUIDs(address)
    }
  }, [address, fetchOwnedUIDs])

  return {
    ownedUIDs,
    isLoading,
    error,
    refetchUIDs,
  }
}

