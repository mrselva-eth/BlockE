'use client'

import { useState, useEffect, useRef, Fragment, useCallback } from 'react'
import Image from 'next/image'
import { useWallet } from '@/contexts/WalletContext'
import { User, LogOut, Lock, Unlock } from 'lucide-react'
import userIcon from '/public/user.png'
import MintModal from './MintModal'
import MintAlertModal from './MintAlertModal'
import { ethers } from 'ethers'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'
import TransactionRejectedMessage from './TransactionRejectedMessage'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import NotificationIcon from './cw2/NotificationIcon'
import { useTheme } from 'next-themes'
import GasPriceDisplay from './GasPriceDisplay'

import { useProfile } from '@/hooks/useProfile' // Import the hook
import { useAutoDisconnect } from '@/hooks/useAutoDisconnect' // Import the hook
import NavbarProfile from './NavbarProfile'; // Import NavbarProfile
import ThemeToggle from '@/components/ThemeToggle' // Import ThemeToggle

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

const POLYGON_CHAIN_ID = '0x89'
const POLYGON_RPC_URL = 'https://polygon-rpc.com'

const RPC_ENDPOINTS = [
'https://polygon-rpc.com',
'https://polygon.llamarpc.com',
'https://rpc-mainnet.maticvigil.com',
'https://polygon-mainnet.public.blastapi.io'
]

export default function NavbarContent() {
const { isConnected, address, disconnectWallet, isAutoDisconnectEnabled, toggleAutoDisconnect, theme } = useWallet() // Access isAutoDisconnectEnabled and toggleAutoDisconnect
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
const pathname = usePathname();
const [profileImage, setProfileImage] = useState<string | null>(null)
const [polygonBalance, setPolygonBalance] = useState<string>('0.00')
const [currentRpcIndex, setCurrentRpcIndex] = useState(0)
const [rpcError, setRpcError] = useState<string | null>(null); // Add RPC error state
const [showTooltip, setShowTooltip] = useState(false) // Add showTooltip state
const [isOpen, setIsOpen] = useState(false); // Add isOpen state


const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()

// Use the useProfile hook
const { profileData, isLoading: profileLoading, error: profileError, refetch } = useProfile(address || "");


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

const fetchProfileImage = useCallback(async () => {
  try {
    const response = await fetch(`/api/profile?address=${address}`)
    if (response.ok) {
      const data = await response.json()

      if (data.profile?.profileImage) {
        // Check if the image is already base64 encoded
        if (typeof data.profile.profileImage === 'string' && data.profile.profileImage.startsWith('data:image/')) {
          setProfileImage(data.profile.profileImage);
        } else {
          // Convert the image buffer to a base64 string
          const imageBase64 = Buffer.from(data.profile.profileImage.buffer).toString('base64');
          setProfileImage(`data:image/png;base64,${imageBase64}`); // or data:image/jpeg;base64 depending on the image type
        }
      } else if (isCEO) {
        // Set default CEO image if no profile image is found
        setProfileImage('/ceo.png');
      }
    }
  } catch (error) {
    console.error('Error fetching profile image:', error)
    if (isCEO) {
      // Set default CEO image if an error occurs
      setProfileImage('/ceo.png');
    }
  }
}, [address, isCEO])

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

const getNextRpcEndpoint = () => {
  const nextIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length
  setCurrentRpcIndex(nextIndex)
  return RPC_ENDPOINTS[nextIndex]
}

const fetchWithFallback = async (fetchFn: () => Promise<any>, attempts = 0): Promise<any> => {
    try {
      return await fetchFn();
    } catch (error: any) {
      if (attempts < RPC_ENDPOINTS.length -1) {
        const nextEndpoint = getNextRpcEndpoint();
        console.warn(`RPC endpoint ${RPC_ENDPOINTS[currentRpcIndex]} failed, trying next...`);
        setRpcError(`RPC endpoint failed. Retrying with ${nextEndpoint}...`); // Set RPC error message
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 10000))); // Exponential backoff with max delay
        return fetchWithFallback(fetchFn, attempts + 1);
      }
      setRpcError('All RPC endpoints failed.'); // Set error message if all endpoints fail
      throw error; // Re-throw the error after all attempts
    }
  };

const fetchTokenBalance = async () => {
  if (!isConnected || !address) {
    setTokenBalance('0')
    return
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[currentRpcIndex])
    const contract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, provider)
  
    const balance = await fetchWithFallback(async () => {
      if (ethers.isAddress(address)) {
        const result = await contract.balanceOf(address)
        // Check for valid result before formatting
        if (result === '0x' || result === null) {
          console.warn('Unexpected balance result:', result)
          return BigInt(0) // Return 0 if the result is invalid
        }
        return result
      } else {
        throw new Error('Invalid address')
      }
    })
  
    setTokenBalance(ethers.formatUnits(balance, 18))
  } catch (error) {
    console.error('Error fetching token balance:', error)
    setTokenBalance('0')
  }
}

const fetchPolygonBalance = useCallback(async () => {
    // Check if address is valid and exists before fetching balance
    if (!address || !ethers.isAddress(address)) {
      setPolygonBalance('0.00');
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[currentRpcIndex]);

      const balance = await fetchWithFallback(async () => provider.getBalance(address)); // Use fetchWithFallback

      if (balance) { // Check if balance is valid before updating state
        setPolygonBalance(ethers.formatEther(balance).slice(0, 6));
        setRpcError(null); // Clear RPC error if successful
      } else {
        throw new Error('Invalid balance received from provider.');
      }
    } catch (error) {
      console.error('Error fetching Polygon balance:', error);
      setPolygonBalance('0.00');
    }
  }, [address, currentRpcIndex]);

useEffect(() => {
  if (address) {
    refetch(); // Fetch profile data when address changes
  }
}, [address, refetch]);

useEffect(() => {
  // Update profile image whenever profileData changes
  if (profileData?.profileImage) {
    setProfileImage(profileData.profileImage);
  } else if (isCEO) {
    setProfileImage('/ceo.png'); // Default CEO image
  } else {
    setProfileImage(null); // Reset to default user icon if no image
  }
}, [profileData, isCEO]);

useEffect(() => {
  // Fetch profile image initially and when address changes
  if (address) {
    fetchProfileImage()
  }
}, [address, fetchProfileImage])

useEffect(() => {
    fetchTokenBalance();
    fetchPolygonBalance(); // Call fetchPolygonBalance here to initialize balance
    const intervalId = setInterval(() => {
      fetchTokenBalance();
      fetchPolygonBalance();
    }, 15000); // Fetch every 15 seconds
    return () => clearInterval(intervalId);
  }, [fetchPolygonBalance, isConnected, address]);


const handleMouseMove = (event: MouseEvent) => {
   if (event.clientX < 50) {
     setIsOpen(true);
   } else if (event.clientX > 300) { // give more space when closing
     setIsOpen(false);
   }
 };

return (
  <>
    <div className={`flex justify-between items-center h-full w-full px-4 ${theme === 'dark' ? 'text-gray-900' : 'text-gray-800'}`}>
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
          <h1 className={`ml-2 mr-4 text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>BlockE</h1>
        </Link>
        {isConnected && (
          <div className="flex items-center ml-2">
            {isCEO ? (
              <div className="flex items-center ml-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
                <Image
                  src={profileImage ? profileImage : "/ceo.png"}
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
                  src={profileImage ? profileImage : userIcon}
                  alt="User"
                  width={20}
                  height={20}
                  className="rounded-full mr-1"
                />
                <span className="text-xs font-semibold">User</span>
              </div>
            )}
            {isConnected && (
              <Fragment>
                <div className="group relative ml-2" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                  <button
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors overflow-hidden"
                    onClick={() => toggleAutoDisconnect(!isAutoDisconnectEnabled)} // Use toggleAutoDisconnect from useWallet
                  >
                    {isAutoDisconnectEnabled ? (
                      <Lock size={20} className="text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Unlock size={20} className="text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  {showTooltip && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap">
                      {isAutoDisconnectEnabled ? 'Disable' : 'Enable'} auto-disconnect
                    </div>
                  )}
                </div>
              </Fragment>
            )}
          </div>
        )}
      </div>
      {isConnected && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group relative">
            <Image
              src="/polygon.png"
              alt="Polygon"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm font-bold text-gray-800 dark:text-white" style={{ fontFamily: 'var(--font-poppins)' }}>
              {rpcError ? rpcError : `${polygonBalance} MATIC`}
            </span>
          </div>
          <GasPriceDisplay network="Polygon" />
          <div className="flex items-center gap-2 group relative">
            <Image
              src="/blocke-logo.png"
              alt="BE Token"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm font-bold text-gray-800 dark:text-white" style={{ fontFamily: 'var(--font-poppins)' }}>
              BE Token: {parseFloat(tokenBalance).toFixed(2)}
            </span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Your BE Token Balance
            </div>
          </div>
          <NotificationIcon size={24} />
          <div className="group relative"> {/* Removed margin */}
            <ThemeToggle /> {/* Add ThemeToggle here */}
            
          </div>
          <button 
            onClick={handleMintClick}
            className={`btn-23 ${theme === 'dark' ? 'bg-purple-700 hover:bg-purple-600' : ''}`}
          >
            <span>Mint BE</span>
          </button>
          <Link href="/blocke-uid">
            <button className={`Btn-Container ${theme === 'dark' ? 'bg-purple-700 hover:bg-purple-600' : ''}`}>
              <span className="text">BlockE UID</span>
              <div className="icon-Container">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </Link>
          <NavbarProfile /> {/* Replaced profile dropdown with NavbarProfile */}
        </div>
      )}
    </div>
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
)
}

