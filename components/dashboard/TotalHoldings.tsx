'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { Wallet, AlertCircle } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import Image from 'next/image'

interface TokenBalance {
  tokenName: string
  symbol: string
  balance: string
  tokenDecimal: string
  contractAddress: string
  price?: number
}

// Enhanced retry mechanism with exponential backoff
const fetchWithRetry = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
): Promise<any> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
        // Add some randomness to prevent thundering herd
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  }
  
  throw lastError;
};

// RPC endpoints with fallback options
const RPC_ENDPOINTS = [
  `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  'https://eth-mainnet.g.alchemy.com/v2/demo',
  'https://cloudflare-eth.com',
  'https://rpc.ankr.com/eth'
];

export default function TotalHoldings({ address }: { address: string }) {
  const [ethBalance, setEthBalance] = useState('0')
  const [usdValue, setUsdValue] = useState('0')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentRpcIndex, setCurrentRpcIndex] = useState(0)
  const [cache, setCache] = useLocalStorage<{
    balance: string
    usdValue: string
    timestamp: number
  } | null>(`holdings_${address}`, null)

  const getNextRpcEndpoint = useCallback(() => {
    const nextIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
    setCurrentRpcIndex(nextIndex);
    return RPC_ENDPOINTS[nextIndex];
  }, [currentRpcIndex]);

  const fetchData = useCallback(async () => {
    if (!address) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Try to fetch balance with retry mechanism
      const balance = await fetchWithRetry(async () => {
        try {
          const provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[currentRpcIndex])
          const balance = await provider.getBalance(address)
          return balance
        } catch (error) {
          console.warn(`RPC endpoint ${currentRpcIndex} failed, trying next...`);
          const nextEndpoint = getNextRpcEndpoint();
          const provider = new ethers.JsonRpcProvider(nextEndpoint)
          return await provider.getBalance(address)
        }
      });

      const ethBalanceFormatted = ethers.formatEther(balance)

      // Try to fetch ETH price with retry mechanism
      const ethPriceData = await fetchWithRetry(async () => {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
          { 
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 } // Cache for 60 seconds
          }
        )
        if (!response.ok) throw new Error('Failed to fetch ETH price')
        return response.json()
      });

      const ethPrice = ethPriceData.ethereum.usd
      const usdValueFormatted = (parseFloat(ethBalanceFormatted) * ethPrice).toFixed(2)

      setEthBalance(ethBalanceFormatted)
      setUsdValue(usdValueFormatted)
      
      // Update cache
      setCache({
        balance: ethBalanceFormatted,
        usdValue: usdValueFormatted,
        timestamp: Date.now()
      })
      
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch holdings. Using cached data if available.')
      
      // Use cached data if available
      if (cache) {
        setEthBalance(cache.balance)
        setUsdValue(cache.usdValue)
      } else {
        setEthBalance('0')
        setUsdValue('0')
      }
    } finally {
      setIsLoading(false)
    }
  }, [address, cache, setCache, currentRpcIndex, getNextRpcEndpoint])

  useEffect(() => {
    const CACHE_TIME = 5 * 60 * 1000 // 5 minutes
    
    if (cache && Date.now() - cache.timestamp < CACHE_TIME) {
      setEthBalance(cache.balance)
      setUsdValue(cache.usdValue)
      setIsLoading(false)
    } else {
      fetchData()
    }

    // Set up polling interval
    const intervalId = setInterval(fetchData, 30000) // Poll every 30 seconds
    return () => clearInterval(intervalId)
  }, [cache, fetchData])

  if (!address) {
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-6 w-32 bg-white/50 rounded mb-4" />
        <div className="h-8 w-24 bg-white/50 rounded mb-2" />
        <div className="h-4 w-20 bg-white/50 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <Image
          src="/ethereum.png"
          alt="Ethereum"
          width={24}
          height={24}
          className="rounded-full"
        />
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Total Holdings
        </h2>
      </div>
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-900">{parseFloat(ethBalance).toFixed(4)} ETH</p>
        <p className="text-sm text-gray-500 dark:text-gray-600">~${usdValue} USD</p>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-2">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

