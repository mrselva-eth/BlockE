'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useTheme } from 'next-themes'

interface GlobalData {
  active_cryptocurrencies: number
  markets: number
  total_market_cap: {
    usd: number
  }
  market_cap_change_percentage_24h_usd: number
  total_volume: {
    usd: number
  }
  market_cap_percentage: {
    btc: number
    eth: number
  }
}

export default function CryptoStatsTicker() {
  const { theme } = useTheme()
  const [data, setData] = useState<GlobalData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/global')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const result = await response.json()
        setData(result.data)
      } catch (err) {
        console.error('Error fetching crypto stats:', err)
        setError('Failed to load market data')
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(3)}T`
    }
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(3)}B`
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(3)}M`
    }
    return `$${num.toFixed(2)}`
  }

  const formatPercentage = (num: number) => {
    return num.toFixed(1)
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 py-2 px-4 text-center">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-10 bg-gray-100 animate-pulse" />
    )
  }

  const stats = [
    {
      label: 'Coins',
      value: data.active_cryptocurrencies.toLocaleString(),
      suffix: '',
    },
    {
      label: 'Exchanges',
      value: data.markets.toLocaleString(),
      suffix: '',
    },
    {
      label: 'Market Cap',
      value: formatNumber(data.total_market_cap.usd),
      changePercent: data.market_cap_change_percentage_24h_usd,
    },
    {
      label: '24h Vol',
      value: formatNumber(data.total_volume.usd),
      suffix: '',
    },
    {
      label: 'Dominance',
      value: `BTC ${formatPercentage(data.market_cap_percentage.btc)}% ETH ${formatPercentage(data.market_cap_percentage.eth)}%`,
      suffix: '',
    },
  ]

  return (
    <div className={`${theme === 'dark' ? 'bg-[#1A1B26]' : 'bg-white'} border-b overflow-hidden w-full`}>
      <div className="marquee-container relative flex whitespace-nowrap">
        <motion.div
          className="flex items-center py-2 gap-8 px-4 animate-marquee"
          initial={{ x: '0%' }}
          animate={{ x: '-50%' }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {[...stats, ...stats].map((stat, index) => (
            <div
              key={`${stat.label}-${index}`}
              className="flex items-center text-sm text-black"
            >
              <span className="text-gray-500">{stat.label}:</span>
              <span className="ml-2 font-medium text-black">{stat.value}</span>
              {stat.changePercent !== undefined && (
                <span
                  className={`ml-2 flex items-center ${
                    stat.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.changePercent >= 0 ? (
                    <ArrowUp size={14} className="inline" />
                  ) : (
                    <ArrowDown size={14} className="inline" />
                  )}
                  {Math.abs(stat.changePercent).toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

