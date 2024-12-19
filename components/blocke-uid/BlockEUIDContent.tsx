'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { ethers } from 'ethers'
import { BLOCKE_UID_CONTRACT_ADDRESS, BLOCKE_UID_ABI } from '@/utils/blockEUIDContract'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'

export default function BlockEUIDContent() {
  const { address } = useWallet()
  const [id, setId] = useState('')
  const [ownedUIDs, setOwnedUIDs] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchOwnedUIDs()
  }, [address])

  const fetchOwnedUIDs = async () => {
    if (!address) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(BLOCKE_UID_CONTRACT_ADDRESS, BLOCKE_UID_ABI, signer)

      const uids = await contract.getOwnedUIDs(address)
      setOwnedUIDs(uids.map((uid: ethers.BigNumberish) => uid.toString()))
    } catch (error) {
      console.error('Error fetching owned UIDs:', error)
    }
  }

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

      const cost = await contract.getCost(id)
      await beTokenContract.approve(BLOCKE_UID_CONTRACT_ADDRESS, cost)

      const tx = await contract.mintUID(id)
      await tx.wait()

      setId('')
      fetchOwnedUIDs()
      alert(`BEUID ${formatUID(id)} successfully minted!`)
    } catch (error) {
      console.error('Error minting BEUID:', error)
      setError('Failed to mint BEUID. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatUID = (uid: string) => `${uid}.BE`;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Mint BlockE UID</h2>
      <input
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="Enter UID number (e.g., 123)"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4"
      />
      <button
        onClick={handleMint}
        disabled={isLoading}
        className="btn-23 w-full mb-4"
      >
        <span>{isLoading ? 'Minting...' : 'Mint BEUID'}</span>
      </button>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        <h3 className="text-xl font-semibold mb-2">Your BEUIDs:</h3>
        {ownedUIDs.length > 0 ? (
          <ul className="list-disc pl-5">
            {ownedUIDs.map((uid: string) => (
              <li key={uid}>{uid}.BE</li>
            ))}
          </ul>
        ) : (
          <p>You don't own any BEUIDs yet.</p>
        )}
      </div>
    </div>
  )
}

