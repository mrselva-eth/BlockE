import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Fuel } from 'lucide-react'

interface GasPriceDisplayProps {
  network: 'Ethereum' | 'Polygon'
}

const GasPriceDisplay: React.FC<GasPriceDisplayProps> = ({ network }) => {
  const [gasPrice, setGasPrice] = useState<number | null>(null)

  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        let apiUrl: string
        if (network === 'Ethereum') {
          apiUrl = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`
        } else {
          apiUrl = `https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY}`
        }

        console.log(`Fetching gas price for ${network}...`) // Debug log

        const response = await fetch(apiUrl)
        const data = await response.json()

        console.log('API Response:', data) // Debug log

        if (data.status === '1' && data.result && data.result.SafeGasPrice) {
          setGasPrice(parseFloat(parseFloat(data.result.SafeGasPrice).toFixed(2)))
        } else {
          console.error('Invalid API response:', data)
          throw new Error('Invalid API response')
        }
      } catch (error) {
        console.error(`Error fetching gas price for ${network}:`, error)
        // Fallback to estimated values
        setGasPrice(network === 'Ethereum' ? 50 : 100) // Estimated values, adjust as needed
      }
    }

    fetchGasPrice()
    const interval = setInterval(fetchGasPrice, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [network])

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
      <Image
        src={network === 'Ethereum' ? "/ethereum.png" : "/polygon.png"}
        alt={`${network} logo`}
        width={20}
        height={20}
      />
      <Fuel size={16} className="text-gray-600 dark:text-gray-400" />
      <span className="text-sm font-medium">
        {gasPrice !== null ? `${gasPrice.toFixed(2)} Gwei` : 'Estimating...'}
      </span>
    </div>
  )
}

export default GasPriceDisplay

