import { X } from 'lucide-react'

interface APRInfoModalProps {
 isOpen: boolean
 onClose: () => void
}

export default function APRInfoModal({ isOpen, onClose }: APRInfoModalProps) {
 if (!isOpen) return null

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full mx-4 relative border border-[#4F46E5] shadow-xl">
       <button
         onClick={onClose}
         className="absolute right-4 top-4 text-gray-500 hover:text-purple-600 transition-colors"
       >
         <X size={24} />
       </button>
       <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] bg-clip-text text-transparent">Understanding APR in Crypto</h2>
       <div className="space-y-4">
         <p className="text-gray-700">
           APR (Annual Percentage Rate) in cryptocurrency staking represents the yearly interest rate for staking your tokens.
         </p>
         <p className="text-gray-700">
           For BlockE staking, we calculate APR as follows:
         </p>
         <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
           <code className="text-purple-600 font-mono">
             APR = (Rewards / Stake Amount) * (365 / Staking Period) * 100%
           </code>
         </div>
         <p className="text-gray-700">
           This rate is annualized, meaning it&apos;s projected over a year, even for shorter staking periods.  {/* The fix: &apos; */}
         </p>
         <p className="text-gray-700">
           Remember, APR doesn&apos;t account for compounding. Actual returns may vary based on market conditions and token price fluctuations. {/* The fix: &apos; */}
         </p>
       </div>
     </div>
   </div>
 )
}

