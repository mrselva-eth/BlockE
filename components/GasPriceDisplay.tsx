import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Fuel, AlertCircle } from "lucide-react"

interface GasPriceDisplayProps {
  network: "Ethereum" | "Polygon"
}

const GasPriceDisplay: React.FC<GasPriceDisplayProps> = ({ network }) => {
  const [gasPrice, setGasPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null) // Add error state
  const [fallbackGasPrice, setFallbackGasPrice] = useState<number | null>(null) // Add fallback state

  const fetchGasPrice = useCallback(async () => {
    try {
      let apiUrl: string
      if (network === "Ethereum") {
        apiUrl = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`
      } else {
        apiUrl = `https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY}`
      }

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.status === "1" && data.result && data.result.SafeGasPrice) {
        const newGasPrice = Number.parseFloat(Number.parseFloat(data.result.SafeGasPrice).toFixed(2))
        setGasPrice(newGasPrice)
        setFallbackGasPrice(newGasPrice) // Update fallback price with successful value
        setError(null) // Clear any previous errors
      } else {
        if (!fallbackGasPrice) {
          // Only set fallback if it's not already set
          setFallbackGasPrice(network === "Ethereum" ? 20 : 50) // Initial fallback values
        }
        setError("Failed to fetch real-time gas price. Displaying fallback value.") // Set error message
      }
    } catch (error) {
      console.error(`Error fetching gas price for ${network}:`, error)
      if (!fallbackGasPrice) {
        // Only set fallback if it's not already set
        setFallbackGasPrice(network === "Ethereum" ? 20 : 50) // Initial fallback values
      }
      setError("Failed to fetch real-time gas price. Displaying fallback value.") // Set error message
    }
  }, [network, fallbackGasPrice]) // Add fallbackGasPrice to dependency array

  useEffect(() => {
    fetchGasPrice()
    const interval = setInterval(fetchGasPrice, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [network, fetchGasPrice])

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 relative">
      {" "}
      {/* Added relative */}
      <Image
        src={network === "Ethereum" ? "/ethereum.png" : "/polygon.png"}
        alt={`${network} logo`}
        width={20}
        height={20}
      />
      <Fuel size={16} className="text-gray-600 dark:text-gray-400" />
      <span className="text-sm font-medium">
        {gasPrice !== null ? `${gasPrice ? gasPrice : fallbackGasPrice} Gwei` : "Loading..."}{" "}
        {/* Display fallback if gasPrice is null */}
      </span>
      {/* Error Alert */}
      {error && (
        <div className="absolute -top-2 -right-2 bg-amber-50 text-amber-700 text-xs rounded-full px-2 py-1 flex items-center gap-x-1 border border-amber-200">
          <AlertCircle className="h-3 w-3" />
          <span>Fallback</span>
        </div>
      )}
    </div>
  )
}

export default GasPriceDisplay

