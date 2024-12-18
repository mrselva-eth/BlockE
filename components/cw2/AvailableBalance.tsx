import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { ChevronUp } from 'lucide-react'
import { getBalance } from '@/utils/cw2ContractInteractions'

interface AvailableBalanceProps {
  onDepositWithdrawClick: () => void
}

export default function AvailableBalance({ onDepositWithdrawClick }: AvailableBalanceProps) {
  const { address } = useWallet()
  const [balance, setBalance] = useState('0')
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        try {
          const userBalance = await getBalance(address)
          setBalance(userBalance)
        } catch (error) {
          console.error('Failed to fetch balance:', error)
        }
      }
    }
    fetchBalance()
  }, [address])

  return (
    <div 
      className="fixed bottom-16 left-16 z-20"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-[2px] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="bg-white rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-600">Available Balance</span>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {balance} BE
                </div>
              </div>
              <button
                onClick={onDepositWithdrawClick}
                className="text-purple-500 hover:text-pink-500 transition-colors"
              >
                <ChevronUp size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-sm rounded-lg py-2 px-3 shadow-xl">
            <div className="relative">
              Your CW² deposited balance for messaging and group creation
              <div className="absolute -bottom-2 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

