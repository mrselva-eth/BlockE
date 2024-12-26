'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { ethers } from 'ethers'
import { BLOCKE_UID_CONTRACT_ADDRESS, BLOCKE_UID_ABI } from '@/utils/blockEUIDContract'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'
import { AlertCircle } from 'lucide-react'

interface BlockEUIDContentProps {
  hasUID: boolean;
  onUIDsFetched: (hasUID: boolean) => void;
}

export default function BlockEUIDContent({ hasUID, onUIDsFetched }: BlockEUIDContentProps) {
  const { address } = useWallet()
  const [id, setId] = useState('')
  const [ownedUIDs, setOwnedUIDs] = useState<Array<{uid: string, formattedUid: string, digits: number}>>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const fetchOwnedUIDs = useCallback(async () => {
    if (!address) return

    setIsFetching(true)
    try {
      const response = await fetch(`/api/beuid?address=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch BEUIDs')
      }

      const data = await response.json()
      if (data.success) {
        setOwnedUIDs(data.ownedUIDs)
        onUIDsFetched(data.ownedUIDs.length > 0)
      } else {
        setOwnedUIDs([])
        onUIDsFetched(false)
      }
    } catch (error) {
      console.error('Error fetching owned UIDs:', error)
      setError('Failed to fetch owned UIDs. Please try again later.')
      setOwnedUIDs([])
      onUIDsFetched(false)
    } finally {
      setIsFetching(false)
    }
  }, [address, onUIDsFetched])

  useEffect(() => {
    fetchOwnedUIDs()
  }, [fetchOwnedUIDs])

  const handleMint = async () => {
    if (!id || !/^\d+$/.test(id)) {
      setError('Please enter a valid numeric ID')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(BLOCKE_UID_CONTRACT_ADDRESS, BLOCKE_UID_ABI, signer)
      const beTokenContract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, signer)

      // Check if ID is already minted
      const isMinted = await contract.idMinted(id)
      if (isMinted) {
        throw new Error('This BEUID is already minted')
      }

      const cost = await contract.getCost(id)
      
      // Check BE token balance
      const balance = await beTokenContract.balanceOf(address)
      if (balance < cost) {
        throw new Error('Insufficient BE token balance')
      }

      // Approve BE token spending
      const approveTx = await beTokenContract.approve(BLOCKE_UID_CONTRACT_ADDRESS, cost)
      await approveTx.wait()

      // Mint BEUID
      const tx = await contract.mintUID(id)
      await tx.wait()

      // Store the newly minted BEUID in MongoDB
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

      setId('')
      await fetchOwnedUIDs()
      alert(`BEUID ${id}.BE successfully minted!`)
    } catch (error: any) {
      console.error('Error minting BEUID:', error)
      if (error.code === 4001) {
        setError('Transaction was rejected by user')
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Failed to mint BEUID. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your BEUIDs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#9333EA] to-[#C026D3]">
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
          {isLoading ? 'Minting...' : 'MINT BEUID'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold mb-4 text-[#9333EA]">
            Your BEUIDs
          </h3>
          {ownedUIDs.length > 0 ? (
            <ul className="space-y-2">
              {ownedUIDs.map((uid) => (
                <li
                  key={uid.uid}
                  className="p-3 bg-purple-50 rounded-lg text-[#9333EA] font-medium"
                >
                  {uid.formattedUid} ({uid.digits} digits)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">You don&apos;t own any BEUIDs yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

