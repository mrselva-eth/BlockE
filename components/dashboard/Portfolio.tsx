'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { PieChartIcon as ChartPie } from 'lucide-react'
import Image from 'next/image'

interface Token {
  symbol: string
  balance: number
}

export default function Portfolio({ address }: { address: string }) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
      const url = `https://api.etherscan.io/api?module=account&action=tokenlist&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${apiKey}`

      try {
        const response = await fetch(url)
        const data = await response.json()
        if (data.status === '1') {
          const tokenData = data.result
            .map((token: any) => ({
              symbol: token.symbol,
              balance: parseFloat(token.value) / Math.pow(10, parseInt(token.tokenDecimal))
            }))
            .filter((token: Token) => token.balance > 0)
          setTokens(tokenData)
        }
      } catch (error) {
        console.error('Error fetching token list:', error)
        setError('Failed to fetch token data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [address])

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  const COLORS = ['#8B5CF6', '#EC4899', '#6366F1', '#10B981', '#F59E0B', '#EF4444']

  const data = tokens.map((token, index) => ({
    name: token.symbol,
    value: token.balance,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/portfolio.gif"
          alt="Portfolio Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-30"
        />
      </div>
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <ChartPie className="w-6 h-6" />
          Token Portfolio
        </h2>

        {tokens.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value.toFixed(4)}`, name]}
                  contentStyle={{ background: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none' }}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No tokens found
          </div>
        )}
      </div>
    </div>
  )
}

