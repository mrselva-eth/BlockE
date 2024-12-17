'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useWallet } from '@/contexts/WalletContext'
import { User, LogOut } from 'lucide-react'
import userIcon from '/public/user.png'
import MintModal from './MintModal'
import MintAlertModal from './MintAlertModal'
import { ethers } from 'ethers'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'
import TransactionRejectedMessage from './TransactionRejectedMessage'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

const POLYGON_CHAIN_ID = '0x89'
const ETH_CHAIN_ID = '0x1'
const POLYGON_RPC_URL = 'https://polygon-rpc.com'

export default function NavbarContent() {
  const { isConnected, address, disconnectWallet, isCorrectNetwork, switchNetwork } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showMintModal, setShowMintModal] = useState(false)
  const [showMintAlertModal, setShowMintAlertModal] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [needsPayment, setNeedsPayment] = useState(false)
  const [targetNetwork, setTargetNetwork] = useState<string | null>(null)
  const [showTransactionRejected, setShowTransactionRejected] = useState(false)
  const [tokenBalance, setTokenBalance] = useState<string>('0')
  const pathname = usePathname()
  const [currentNetwork, setCurrentNetwork] = useState<'Ethereum' | 'Polygon' | null>(null)

  const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()

  const handleLogout = () => {
    disconnectWallet()
    setShowDropdown(false)
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-3)}`
  }

  const handleMintClick = () => {
    if (pathname === '/dashboard') {
      setShowMintAlertModal(true)
    } else {
      setShowMintModal(true)
    }
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

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (isConnected && address) {
        try {
          const polygonProvider = new ethers.JsonRpcProvider(POLYGON_RPC_URL)
          const contract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, polygonProvider)
          const balance = await contract.balanceOf(address)
          setTokenBalance(ethers.formatUnits(balance, 18))
        } catch (error) {
          console.error('Error fetching token balance:', error)
          setTokenBalance('0')
        }
      }
    }

    fetchTokenBalance()
  }, [isConnected, address])

  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const chainId = '0x' + network.chainId.toString(16)

        if (chainId === ETH_CHAIN_ID) {
          setCurrentNetwork('Ethereum')
        } else if (chainId === POLYGON_CHAIN_ID) {
          setCurrentNetwork('Polygon')
        } else {
          setCurrentNetwork(null)
        }
      }
    }

    checkNetwork()
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork)
      return () => {
        window.ethereum.removeListener('chainChanged', checkNetwork)
      }
    }
  }, [])

  return (
    <div className="flex justify-between items-center h-full w-full px-4">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
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
        </Link>
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
          <div className="flex items-center gap-2 group relative">
            <Image
              src="/blocke-logo.png"
              alt="BE Token"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm font-bold text-gray-800" style={{ fontFamily: 'var(--font-poppins)' }}>
              BE Token: {parseFloat(tokenBalance).toFixed(2)}
            </span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Your BE Token Balance (on Polygon)
            </div>
          </div>
          <button 
            onClick={handleMintClick}
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
                    <Image 
                      src={currentNetwork === 'Ethereum' ? "/ethereum.png" : "/polygon.png"} 
                      alt={`${currentNetwork} logo`} 
                      width={16} 
                      height={16} 
                      className="mr-2" 
                    />
                    <p>Network: {currentNetwork || 'Unknown'}</p>
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
        <MintAlertModal
          isOpen={showMintAlertModal}
          onClose={() => setShowMintAlertModal(false)}
        />
        {showTransactionRejected && (
          <TransactionRejectedMessage onClose={() => setShowTransactionRejected(false)} />
        )}
      </>
    </div>
  )
}

