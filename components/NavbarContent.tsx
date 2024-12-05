'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useWallet } from '@/contexts/WalletContext'
import { User, LogOut } from 'lucide-react'
import userIcon from '/public/user.png'
import MintModal from './MintModal'
import { ethers } from 'ethers'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'
import TransactionRejectedMessage from './TransactionRejectedMessage'

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

const POLYGON_CHAIN_ID = '0x89'
const ETH_CHAIN_ID = '0x1'

export default function NavbarContent() {
  const { isConnected, address, disconnectWallet, isCorrectNetwork, switchNetwork } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showMintModal, setShowMintModal] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [needsPayment, setNeedsPayment] = useState(false)
  const [targetNetwork, setTargetNetwork] = useState<string | null>(null)
  const [showTransactionRejected, setShowTransactionRejected] = useState(false)

  const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()

  const handleLogout = () => {
    disconnectWallet()
    setShowDropdown(false)
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-3)}`
  }

  const handleMint = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      if (chainId !== POLYGON_CHAIN_ID) {
        setTargetNetwork('Polygon')
        return
      }

      setIsMinting(true)

      if (!window.ethereum) {
        throw new Error("No Ethereum provider found. Please install MetaMask or another wallet.")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      if (!signer) {
        throw new Error("Failed to get signer. Please check your wallet connection.")
      }

      const beTokenContract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, signer)

      if (!address) {
        throw new Error("Wallet address not found.")
      }

      const hasClaimedFree = await beTokenContract.hasClaimedFree(address)
      setNeedsPayment(hasClaimedFree)

      let tx
      if (hasClaimedFree) {
        const maticCost = await beTokenContract.MATIC_COST()
        tx = await beTokenContract.mint({ value: maticCost })
      } else {
        tx = await beTokenContract.mint()
      }

      await tx.wait()
      setMintSuccess(true)
    } catch (error: any) {
      console.error('Minting failed:', error)
      
      if (error.code === 4001 || (error.info && error.info.error && error.info.error.code === 4001)) {
        setShowTransactionRejected(true)
      } else if (error.code === -32002) {
        alert('Please check your wallet - you have a pending request.')
      } else if (error.message && typeof error.message === 'string') {
        alert(error.message)
      } else {
        alert('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsMinting(false)
    }
  }

  const handleNetworkSwitch = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }],
      })
      setTargetNetwork(null)
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="flex justify-between items-center h-full w-full px-4">
      <div className="flex items-center">
        <div className="relative h-10 w-10">
          <Image
            src="/blocke-logo.png"
            alt="BlockE Logo"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            priority
          />
        </div>
        <h1 className="ml-2 mr-4 text-xl sm:text-2xl font-bold text-gray-800">BlockE</h1>
        {isConnected && (
          <div className="flex items-center ml-2">
            {isCEO ? (
              <div className="flex items-center ml-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
                <Image
                  src="/ceo.png"
                  alt="CEO"
                  width={20}
                  height={20}
                  className="rounded-full mr-1"
                />
                <span className="text-xs font-semibold">CEO</span>
              </div>
            ) : (
              <div className="flex items-center ml-0 bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full">
                <Image
                  src={userIcon}
                  alt="User"
                  width={20}
                  height={20}
                  className="rounded-full mr-1"
                />
                <span className="text-xs font-semibold">User</span>
              </div>
            )}
          </div>
        )}
      </div>
      {isConnected && (
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowMintModal(true)}
            className="btn-23"
          >
            <span>Mint BE</span>
          </button>
          <button className="Btn-Container">
            <span className="text">BlockE UID</span>
            <div className="icon-Container">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 8h14M8 1l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <User size={24} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-700">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <p className="font-semibold">Connected Wallet:</p>
                  </div>
                  <p>{address ? truncateAddress(address) : 'Not connected'}</p>
                </div>
                <div className="px-4 py-2 text-sm text-gray-700 border-t border-gray-100">
                  <div className="flex items-center">
                    <Image src="/ethereum.png" alt="Ethereum logo" width={16} height={16} className="mr-2" />
                    <p>Network: Ethereum Mainnet</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={18} className="mr-2" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <>
        <MintModal
          isOpen={showMintModal}
          onClose={() => {
            setShowMintModal(false)
            setMintSuccess(false)
            setTargetNetwork(null)
          }}
          onMint={handleMint}
          isMinting={isMinting}
          isSuccess={mintSuccess}
          needsPayment={needsPayment}
          onSwitch={handleNetworkSwitch}
          targetNetwork={targetNetwork || undefined}
        />
        {showTransactionRejected && (
          <TransactionRejectedMessage onClose={() => setShowTransactionRejected(false)} />
        )}
      </>
    </div>
  )
}

