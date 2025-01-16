'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { ethers } from 'ethers'
import { BLOCKE_UID_CONTRACT_ADDRESS, BLOCKE_UID_ABI } from '@/utils/blockEUIDContract'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'
import { useBlockEUID } from '@/hooks/useBlockEUID'
import BEUIDCard from './BEUIDCard'
import { AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import TransactionRejectedMessage from '../TransactionRejectedMessage'
import { useRouter } from 'next/navigation'

interface BlockEUIDContentProps {
hasUID: boolean;
onUIDsFetched: (hasUID: boolean) => void;
}

export default function BlockEUIDContent({ hasUID, onUIDsFetched }: BlockEUIDContentProps) {
const { address } = useWallet()
const [id, setId] = useState('')
const { ownedUIDs, isLoading, error: fetchError, refetchUIDs } = useBlockEUID()
const [error, setError] = useState('')
const [showMintedAlert, setShowMintedAlert] = useState(false)
const [showTransactionRejected, setShowTransactionRejected] = useState(false)
const [showCongratulation, setShowCongratulation] = useState(false)
const [showInsufficientBalanceAlert, setShowInsufficientBalanceAlert] = useState(false);
const [showDetails, setShowDetails] = useState(false) // Added state variable
const router = useRouter()

const handleMint = async () => {
if (!id || !/^\d+$/.test(id)) {
  setError('Please enter a valid numeric ID')
  return
}

setError('')

try {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(BLOCKE_UID_CONTRACT_ADDRESS, BLOCKE_UID_ABI, signer)
  const beTokenContract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, signer)

  // Check if ID is already minted
  const isMinted = await contract.idMinted(id)
  if (isMinted) {
    setShowMintedAlert(true)
    setTimeout(() => setShowMintedAlert(false), 3000)
    return
  }

  const cost = await contract.getCost(id)
  
  // Check BE token balance
  const balance = address ? await beTokenContract.balanceOf(address) : BigInt(0)
  if (balance < cost) {
    setShowInsufficientBalanceAlert(true); // Show the alert
    return
  }

  // Approve BE token spending
  const approveTx = await beTokenContract.approve(BLOCKE_UID_CONTRACT_ADDRESS, cost)
  await approveTx.wait()

  // Mint BEUID
  const tx = await contract.mintUID(id)
  await tx.wait()

  // Store the newly minted BEUID in MongoDB
  if (address) {
    await fetch('/api/beuid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        uid: id,
      }),
    })
  }

  // Redirect to /blocke-uid
  router.push('/blocke-uid')

  setId('')
  setShowCongratulation(true) // Show congratulation animation
  setTimeout(() => setShowCongratulation(false), 5000) // Hide after 5 seconds
  refetchUIDs()
} catch (error: any) {
  const errorString = JSON.stringify(error);
  if (
    errorString.includes('user rejected') ||
    errorString.includes('User denied') ||
    errorString.includes('ACTION_REJECTED') ||
    error.code === 4001 ||
    error.code === -32603 ||
    (error.info && error.info.error && error.info.error.code === 4001)
  ) {
    setShowTransactionRejected(true);
    setError('');
  } else if (error.message) {
    setError(error.message);
  } else {
    setError('Failed to mint BEUID. Please try again.');
  }
}
}

if (isLoading) {
return (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600">Loading your BEUIDs...</p>
    </div>
  </div>
)
}

const handleCloseInsufficientBalanceAlert = () => {
setShowInsufficientBalanceAlert(false);
};

return (
<div className="w-full max-w-4xl mx-auto">
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
      Mint BlockE UID
    </h2>

    <div className="space-y-6">
      <div>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter UID number (e.g., 123)"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600"
        />
      </div>

      <button
        onClick={handleMint}
        disabled={isLoading}
        className="btn-23 w-full"
      >
        <span>
          {isLoading ? 'Minting...' : 'MINT BEUID'}
        </span>
      </button>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors w-full"
      >
        {showDetails ? 'Hide Details' : 'Show Cost Details'}
      </button>

      {showDetails && (
        <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200">
          <h4 className="text-lg font-semibold mb-2">UID Cost Based on Digits</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>1-3 digits: 20000 BE</li>
            <li>4-5 digits: 15000 BE</li>
            <li>6-7 digits: 8000 BE</li>
            <li>8-10 digits: 4000 BE</li>
            <li>10+ digits: 500 BE</li>
          </ul>
        </div>
      )}

      {(error || fetchError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error || fetchError}</p>
        </div>
      )}

      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
          Your BEUIDs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ownedUIDs.length > 0 ? (
            ownedUIDs.map((uid) => (
              <BEUIDCard
                key={uid.uid}
                uid={uid.uid}
                formattedUid={uid.formattedUid}
                digits={uid.digits}
                mintedAt={new Date()}
              />
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300 col-span-2">
              No BlockE UIDs found
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
  <AnimatePresence>
    {showMintedAlert && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          className="bg-white rounded-lg p-8 shadow-xl text-center"
        >
          <Image
            src="/alreadyminted.gif"
            alt="Already Minted"
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <h3 className="text-2xl font-bold mb-2 text-red-600">Already Minted!</h3>
          <p className="text-gray-600">This BEUID has already been minted.</p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  {showTransactionRejected && (
    <TransactionRejectedMessage onClose={() => setShowTransactionRejected(false)} />
  )}
  {/* Congratulation Animation */}
  <AnimatePresence>
    {showCongratulation && (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
      >
        <motion.div className="relative w-96 h-96">
          <Image
            src="/congratulation.gif"
            alt="Congratulation"
            fill
            className="object-contain"
          />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  {/* Insufficient Balance Alert */}
  {showInsufficientBalanceAlert && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center relative">
        <button
          onClick={handleCloseInsufficientBalanceAlert}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} className="text-indigo-600 hover:text-purple-600" />
        </button>
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h2 className="text-2xl font-bold mb-4 text-red-600 font-poppins">Insufficient BE Tokens</h2>
        <p className="mb-6 text-gray-700">You don&apos;t have enough BE tokens to mint this BlockE UID. Please obtain more BE tokens before trying again.</p>
        <button
          onClick={handleCloseInsufficientBalanceAlert}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  )}
</div>
)
}