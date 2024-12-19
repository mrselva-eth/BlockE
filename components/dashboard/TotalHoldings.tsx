'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Wallet, AlertCircle, RefreshCw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

interface TokenHolding {
  tokenName: string;
  symbol: string;
  balance: string;
  tokenDecimal: number;
  value: number;
  contractAddress: string;
}

interface Holdings {
  ethBalance: string;
  ethValue: number;
  ethPrice: number;
  tokens: TokenHolding[];
  totalTokenValue: number;
}

export default function TotalHoldings({ address }: { address: string }) {
  const [holdings, setHoldings] = useState<Holdings>({
    ethBalance: '0',
    ethValue: 0,
    ethPrice: 0,
    tokens: [],
    totalTokenValue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTokens, setShowTokens] = useState(false)

  const fetchHoldings = async (retryCount = 0) => {
    setIsLoading(true)
    setError(null)
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY

    try {
      // Fetch ETH balance
      const balanceResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
      )
      const balanceData = await balanceResponse.json()

      if (balanceData.status !== '1') {
        throw new Error('Failed to fetch ETH balance')
      }

      // Fetch token holdings
      const tokenResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${apiKey}`
      )
      const tokenData = await tokenResponse.json()

      // Fetch current ETH price from CoinGecko
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const priceData = await priceResponse.json()
      const ethPrice = priceData.ethereum?.usd || 3674.99 // Fallback to Etherscan's price if API fails

      const balanceInWei = ethers.parseUnits(balanceData.result, 'wei')
      const balanceInEth = ethers.formatEther(balanceInWei)
      const ethValue = parseFloat(balanceInEth) * ethPrice

      // Process token transactions to get current holdings
      const tokenTxs = tokenData.status === '1' ? tokenData.result : []
      const tokenHoldings = new Map<string, TokenHolding>()

      if (tokenData.status === '1' && tokenData.result) {
        for (const tx of tokenData.result) {
          const key = tx.contractAddress
          if (!tokenHoldings.has(key)) {
            tokenHoldings.set(key, {
              tokenName: tx.tokenName,
              symbol: tx.tokenSymbol,
              balance: '0',
              tokenDecimal: parseInt(tx.tokenDecimal),
              value: 0,
              contractAddress: tx.contractAddress
            })
          }

          const holding = tokenHoldings.get(key)!
          const amount = ethers.formatUnits(tx.value, holding.tokenDecimal)

          if (tx.to.toLowerCase() === address.toLowerCase()) {
            holding.balance = (parseFloat(holding.balance) + parseFloat(amount)).toString()
          } else if (tx.from.toLowerCase() === address.toLowerCase()) {
            holding.balance = (parseFloat(holding.balance) - parseFloat(amount)).toString()
          }
        }
      }


      // Filter out zero balances
      const tokens = Array.from(tokenHoldings.values()).filter(token => parseFloat(token.balance) > 0)

      // Fetch token prices from CoinGecko
      const tokenAddresses = tokens.map(token => token.contractAddress).join(',')
      const tokenPriceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddresses}&vs_currencies=usd`)
      const tokenPriceData = await tokenPriceResponse.json()

      // Calculate token values
      tokens.forEach(token => {
        const price = tokenPriceData[token.contractAddress.toLowerCase()]?.usd || 0
        token.value = parseFloat(token.balance) * price
      })

      const totalTokenValue = tokens.reduce((sum, token) => sum + token.value, 0)

      setHoldings({
        ethBalance: parseFloat(balanceInEth).toFixed(4),
        ethValue: ethValue,
        ethPrice: ethPrice,
        tokens,
        totalTokenValue
      })
    } catch (error) {
      console.error('Error fetching holdings:', error)
      if (retryCount < 3) {
        setTimeout(() => fetchHoldings(retryCount + 1), 1000 * (retryCount + 1))
      } else {
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHoldings()
  }, [address])

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
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-100">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
        <Wallet className="w-6 h-6" />
        Total Holdings
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">ETH Balance</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{holdings.ethBalance}</p>
            <p className="text-lg text-gray-600">ETH</p>
          </div>
          <p className="text-sm text-gray-500">
            ${holdings.ethValue.toFixed(2)} USD (@ ${holdings.ethPrice.toFixed(2)}/ETH)
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Token Holdings</p>
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
            >
              {holdings.tokens.length} tokens
              {showTokens ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          <p className="text-2xl font-semibold text-gray-700">
            ${holdings.totalTokenValue.toFixed(2)}
          </p>

          {showTokens && (
            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
              {holdings.tokens.map((token) => (
                <div key={token.contractAddress} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{token.tokenName}</p>
                      <p className="text-sm text-gray-500">{token.symbol}</p>
                    </div>
                    <a
                      href={`https://etherscan.io/token/${token.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <div className="mt-2 flex justify-between items-baseline">
                    <p className="text-sm">{parseFloat(token.balance).toFixed(4)} {token.symbol}</p>
                    <p className="text-sm font-medium">${token.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-gray-900">
            ${(holdings.ethValue + holdings.totalTokenValue).toFixed(2)}
          </p>
        </div>

        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => fetchHoldings()}
              className="ml-2 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

