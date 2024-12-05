'use client'

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

interface WalletContextType {
  signer: ethers.Signer | null
  address: string | null
  isConnected: boolean
  showWalletModal: boolean
  setShowWalletModal: (show: boolean) => void
  connectWallet: (providerType: string) => Promise<void>
  disconnectWallet: () => void
  verifyCaptcha: (token: string) => Promise<boolean>
  isCorrectNetwork: boolean
  switchNetwork: () => Promise<void>
  showSuccessAnimation: boolean
  setShowSuccessAnimation: (show: boolean) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const ETH_MAINNET_CHAIN_ID = '0x1'

const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "BlockE",
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID
    }
  }
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const web3ModalRef = useRef<Web3Modal | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      web3ModalRef.current = new Web3Modal({
        cacheProvider: true,
        providerOptions,
      })
    }

    // Check for saved connection on initial load
    const savedConnection = localStorage.getItem('walletConnection')
    if (savedConnection) {
      const { providerType } = JSON.parse(savedConnection)
      connectWallet(providerType, true)
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [])

  const verifyCaptcha = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to verify CAPTCHA')
      }

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('CAPTCHA verification failed:', error)
      return false
    }
  }, [])

  const checkNetwork = useCallback(async (provider: any) => {
    if (provider.request) {
      const chainId = await provider.request({ method: 'eth_chainId' })
      const isCorrect = chainId === ETH_MAINNET_CHAIN_ID
      setIsCorrectNetwork(isCorrect)
      return isCorrect
    }
    return false
  }, [])

  const switchNetwork = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ETH_MAINNET_CHAIN_ID }],
        })
        setIsCorrectNetwork(true)
      } catch (error: any) {
        if (error.code === 4902) {
          throw new Error("This wallet doesn't have Ethereum Mainnet added. Please add it manually and try again.")
        } else {
          throw new Error("Failed to switch to the Ethereum Mainnet.")
        }
      }
    }
  }, [])

  const connectWallet = useCallback(async (providerType: string, isAutoConnect: boolean = false) => {
    try {
      if (!web3ModalRef.current) {
        throw new Error("Web3Modal not initialized.")
      }

      let provider
      switch (providerType) {
        case 'metamask':
          if (typeof window !== 'undefined' && window.ethereum) {
            provider = window.ethereum
          }
          break
        case 'okx':
          if (typeof window !== 'undefined' && window.okxwallet) {
            provider = window.okxwallet
          }
          break
        case 'trust':
          if (typeof window !== 'undefined' && window.trustwallet) {
            provider = window.trustwallet
          }
          break
        default:
          provider = await web3ModalRef.current.connect()
      }

      if (!provider) {
        throw new Error("No provider available")
      }

      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()
      const address = await signer.getAddress()
      
      setSigner(signer)
      setAddress(address)
      setIsConnected(true)
      setShowWalletModal(false)
      if (!isAutoConnect) {
        setShowSuccessAnimation(true)
      }
      
      if (provider.on) {
        provider.on('accountsChanged', handleAccountsChanged)
        provider.on('chainChanged', handleChainChanged)
      }

      // Check network after successful connection
      await checkNetwork(provider)

      // Save connection info to local storage
      localStorage.setItem('walletConnection', JSON.stringify({ providerType, address }))

    } catch (error: any) {
      console.error("Failed to connect:", error)
      if (error.message.includes("User rejected the request")) {
        console.log("User rejected the wallet connection request")
      } else {
        disconnectWallet()
      }
      throw error
    }
  }, [checkNetwork])

  const disconnectWallet = useCallback(() => {
    if (web3ModalRef.current) {
      web3ModalRef.current.clearCachedProvider()
    }
    setSigner(null)
    setAddress(null)
    setIsConnected(false)
    setIsCorrectNetwork(false)
    setShowSuccessAnimation(false)
    
    // Clear saved connection from local storage
    localStorage.removeItem('walletConnection')
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else if (accounts[0] !== address) {
      setAddress(accounts[0])
      // Update saved connection in local storage
      const savedConnection = localStorage.getItem('walletConnection')
      if (savedConnection) {
        const { providerType } = JSON.parse(savedConnection)
        localStorage.setItem('walletConnection', JSON.stringify({ providerType, address: accounts[0] }))
      }
    }
  }, [address, disconnectWallet])

  const handleChainChanged = useCallback(async () => {
    if (window.ethereum) {
      await checkNetwork(window.ethereum)
    }
  }, [checkNetwork])

  const contextValue = {
    signer,
    address,
    isConnected,
    showWalletModal,
    setShowWalletModal,
    connectWallet,
    disconnectWallet,
    verifyCaptcha,
    isCorrectNetwork,
    switchNetwork,
    showSuccessAnimation,
    setShowSuccessAnimation
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

