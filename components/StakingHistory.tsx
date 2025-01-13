import { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { BE_STAKING_ADDRESS, BE_STAKING_ABI } from '@/utils/beStakingABI'
import { useWallet } from '@/contexts/WalletContext'
import { format } from 'date-fns'
import TransactionRejectedMessage from './TransactionRejectedMessage'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface Stake {
 amount: bigint
 startTime: bigint
 endTime: bigint
 apr: bigint
 reward: bigint
 claimed: boolean
 unstaked: boolean
 txHash: string;
}

interface StakingHistoryProps {
 onStakeUpdate: () => void
 transactionPending: boolean
 stakingData: {
   everStaked: boolean;
   everClaimed: boolean;
   everUnstaked: boolean;
   staked: StakeData[];
 };
}

interface StakeData {
 transactionHash: string;
 amount: string;
 periodIndex: number;
 startTime: number;
 endTime: number;
 apr: number;
 expectedBE: string;
 claimed: boolean;
 unstaked: boolean;
}


const safeFormatUnits = (value: bigint | null | undefined, decimals: number): string => {
 if (!value || value === BigInt(0)) return '0';
 try {
   return ethers.formatUnits(value, decimals);
 } catch (error) {
   console.error('Error formatting units:', error);
   return '0';
 }
};

const safeFormatDate = (timestamp: bigint | null | undefined): string => {
 if (!timestamp || timestamp === BigInt(0)) return 'N/A';
 try {
   const date = new Date(Number(timestamp) * 1000);
   return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy HH:mm:ss');
 } catch (error) {
   console.error('Error formatting date:', error);
   return 'N/A';
 }
};

export default function StakingHistory({ onStakeUpdate, transactionPending, stakingData }: StakingHistoryProps) {
 const { address } = useWallet()
 const [stakes, setStakes] = useState<Stake[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [showRejected, setShowRejected] = useState(false)
 const [unstaking, setUnstaking] = useState<number | null>(null)
 const [currentPage, setCurrentPage] = useState(1)
 const stakesPerPage = 2

 const fetchStakes = useCallback(async () => {
   if (!address || !ethers.isAddress(address)) { // Check if address is valid and exists
     setIsLoading(false)
     return
   }

   setIsLoading(true);
   setError(null);

   try {
     const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
     const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, provider);
     const userStakes = await contract.getUserStakes(address);
     
     // Validate stake data
     const validatedStakes = userStakes.map((stake: Stake) => ({
       ...stake,
       amount: stake.amount || BigInt(0),
       startTime: stake.startTime || BigInt(0),
       endTime: stake.endTime || BigInt(0),
       apr: stake.apr || BigInt(0),
       reward: stake.reward || BigInt(0),
       claimed: Boolean(stake.claimed),
       unstaked: Boolean(stake.unstaked),
     }));
     
     // Fetch transaction hashes
     const stakedFilter = contract.filters.Staked(address);
     const stakedEvents = await contract.queryFilter(stakedFilter);
     
     const stakesWithTxHash = validatedStakes.map((stake: Stake, index: number) => ({
       ...stake,
       txHash: stakedEvents[index]?.transactionHash || '',
     }));
     
     // Sort stakes by startTime in descending order (most recent first)
     stakesWithTxHash.sort((a: Stake, b: Stake) => Number(b.startTime) - Number(a.startTime));

     setStakes(stakesWithTxHash);
   } catch (err) {
     console.error('Error fetching stakes:', err);
     setError('Failed to fetch staking history. Please try again.');
   } finally {
     setIsLoading(false);
   }
 }, [address]);

 useEffect(() => {
   fetchStakes()
 }, [fetchStakes, transactionPending])

 const handleClaim = async (index: number) => {
   if (!address) return

   try {
     const provider = new ethers.BrowserProvider(window.ethereum)
     const signer = await provider.getSigner()
     const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, signer)

     const tx = await contract.claimReward(index)
     await tx.wait()

     // Update claimed status in the database
     await fetch('/api/staking/claim', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },      
       body: JSON.stringify({ address, txHash: stakes[index].txHash }), // Send txHash
     })

     onStakeUpdate()
     fetchStakes()
   } catch (error: any) {
     console.error('Claim error:', error)
     if (error.code === 4001) {
       setShowRejected(true)
     } else {
       alert(`Claim failed: ${error.message || 'Unknown error'}`)
     }
   }
 }

 const handleUnstake = async (index: number) => {
   if (!address) return

   setUnstaking(index)
   try {
     const provider = new ethers.BrowserProvider(window.ethereum)
     const signer = await provider.getSigner()
     const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, signer)

     const tx = await contract.unstake(index)
     await tx.wait()

     // Update unstaked status in the database
     await fetch('/api/staking/unstake', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },      
       body: JSON.stringify({ address, txHash: stakes[index].txHash }), // Send txHash
     })

     onStakeUpdate()
     fetchStakes()
   } catch (error: any) {
     console.error('Unstake error:', error)
     if (error.code === 4001) {
       setShowRejected(true)
     } else {
       alert(`Unstake failed: ${error.message || 'Unknown error'}`)
     }
   } finally {
     setUnstaking(null)
   }
 }

 if (isLoading) {
   return (
     <div className="flex justify-center items-center h-64">
       <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
     </div>
   )
 }

 if (error) {
   return (
     <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
       <p className="font-bold">Error</p>
       <p>{error}</p>
     </div>
   )
 }

 const indexOfLastStake = currentPage * stakesPerPage
 const indexOfFirstStake = indexOfLastStake - stakesPerPage
 const currentStakes = stakes.slice(indexOfFirstStake, indexOfLastStake)
 const totalPages = Math.ceil(stakes.length / stakesPerPage)

 const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

 return (
   <div className="space-y-6">
     <AnimatePresence mode="wait">
       <motion.div
         key={currentPage}
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}
         transition={{ duration: 0.3 }}
       >
         {currentStakes.map((stake, index) => {
           const startDate = new Date(Number(stake.startTime) * 1000)
           const endDate = new Date(Number(stake.endTime) * 1000)
           const now = new Date()
           const isLocked = stake.endTime ? now < new Date(Number(stake.endTime) * 1000) : false;

           return (
             <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
               <div className="flex justify-between items-center mb-4">
                 <div>
                   <p className="text-2xl font-bold text-purple-600">
                     {safeFormatUnits(stake.amount, 18)} BE
                   </p>
                   <p className="text-sm text-gray-500">
                     APR: <span className="font-semibold text-green-500">{stake.apr && stake.apr > BigInt(0) ? `${Number(stake.apr) / 100}%` : 'N/A'}</span>
                   </p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm">
                     Start: <span className="font-medium">{safeFormatDate(stake.startTime)}</span>
                   </p>
                   <p className="text-sm">
                     End: <span className="font-medium">{safeFormatDate(stake.endTime)}</span>
                   </p>
                 </div>
               </div>
               <div className="flex justify-between items-center">
                 <p className="text-lg">
                   Reward: <span className="font-bold text-green-500">{safeFormatUnits(stake.reward, 18)} BE</span>
                 </p>
                 <div className="space-x-2">
                   <button
                     onClick={() => handleClaim(indexOfFirstStake + index)}
                     disabled={isLocked || stake.claimed || stake.unstaked}
                     className={`button ${
                       isLocked || stake.claimed || stake.unstaked
                         ? 'opacity-50 cursor-not-allowed bg-gray-400'
                         : ''
                     }`}
                   >
                     <span className="inner">
                       {stake.claimed ? 'Claimed' : 'Claim'}
                     </span>
                     <span className="points_wrapper">
                       {[...Array(10)].map((_, i) => (
                         <span key={i} className="point"></span>
                       ))}
                     </span>
                     <span className="fold"></span>
                   </button>

                   <button
                     onClick={() => handleUnstake(indexOfFirstStake + index)}
                     disabled={isLocked || stake.unstaked || unstaking === indexOfFirstStake + index}
                     className={`button ${
                       isLocked || stake.unstaked || unstaking === indexOfFirstStake + index
                         ? 'opacity-50 cursor-not-allowed bg-gray-400'
                         : ''
                     }`}
                   >
                     <span className="inner">
                       {unstaking === indexOfFirstStake + index ? 'Unstaking...' : stake.unstaked ? 'Unstaked' : 'Unstake'}
                     </span>
                     <span className="points_wrapper">
                       {[...Array(10)].map((_, i) => (
                         <span key={i} className="point"></span>
                       ))}
                     </span>
                     <span className="fold"></span>
                   </button>
                 </div>
               </div>
               <div className="mt-2 text-right">
                 <a
                   href={`https://polygonscan.com/tx/${stake.txHash}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center text-purple-600 hover:text-purple-800"
                 >
                   View Transaction <ExternalLink size={16} className="ml-1" />
                 </a>
               </div>
             </div>
           )
         })}
       </motion.div>
     </AnimatePresence>

     {stakes.length > stakesPerPage && (
       <div className="flex justify-center items-center mt-8 space-x-4">
         <button
           onClick={() => paginate(Math.max(1, currentPage - 1))}
           disabled={currentPage === 1}
           className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors duration-200"
         >
           <ChevronLeft size={24} />
         </button>
         <span className="text-lg font-medium">
           Page {currentPage} of {totalPages}
         </span>
         <button
           onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
           disabled={currentPage === totalPages}
           className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors duration-200"
         >
           <ChevronRight size={24} />
         </button>
       </div>
     )}

     {showRejected && (
       <TransactionRejectedMessage onClose={() => setShowRejected(false)} />
     )}
   </div>
 )
}

