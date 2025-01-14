import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Loader from '../Loader'
import { AlertCircle } from 'lucide-react'

interface PortfolioPerformanceProps {
  address: string
}

interface PortfolioData {
  date: string
  value: number
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, retries = 3, backoff = 300): Promise<any> => { // Specify return type
  try {
    const response = await fetch(url);
    if (response.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export default function PortfolioPerformance({ address }: PortfolioPerformanceProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPortfolioPerformance = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchWithRetry(`/api/portfolio-performance?address=${address}`);

        if (data.success) {
          setPortfolioData(data.portfolioData)
        } else {
          throw new Error(data.error || 'Failed to fetch portfolio performance data')
        }
      } catch (err) {
        console.error('Error fetching portfolio performance:', err)
        setError('Failed to fetch portfolio performance. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolioPerformance()
  }, [address])

  if (isLoading || error) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg h-[500px]"> {/* Added fixed height and increased padding */}
        <div className="h-[400px]"> {/* Increased height */}
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader size={24} className="text-purple-500" />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="flex items-center justify-center text-red-500">
                <AlertCircle className="mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg h-[500px]"> {/* Added fixed height and increased padding */}
      <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Portfolio Performance
      </h2>
      <div className="h-[400px]"> {/* Increased height */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={portfolioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis 
              dataKey="date" 
              stroke="#718096"
              tick={{ fontSize: 12 }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              stroke="#718096"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="value"
              name="Portfolio Value"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

