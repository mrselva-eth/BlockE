'use client'

import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
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

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [])

  const verifyCaptcha = async (token: string): Promise<boolean> => {
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
  }

  const checkNetwork = async (provider: any) => {
    if (provider.request) {
      const chainId = await provider.request({ method: 'eth_chainId' })
      const isCorrect = chainId === ETH_MAINNET_CHAIN_ID
      setIsCorrectNetwork(isCorrect)
      return isCorrect
    }
    return false
  }

  const switchNetwork = async () => {
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
  }

  const connectWallet = async (providerType: string) => {
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
      setShowSuccessAnimation(true)
      
      if (provider.on) {
        provider.on('accountsChanged', handleAccountsChanged)
        provider.on('chainChanged', handleChainChanged)
      }

      // Check network after successful connection
      await checkNetwork(provider)
    } catch (error: any) {
      console.error("Failed to connect:", error)
      if (error.message.includes("User rejected the request")) {
        // Handle user rejection gracefully
        console.log("User rejected the wallet connection request")
        // You might want to show a user-friendly message here
      } else {
        // Handle other errors
        disconnectWallet()
      }
      throw error
    }
  }

  const disconnectWallet = () => {
    if (web3ModalRef.current) {
      web3ModalRef.current.clearCachedProvider()
    }
    setSigner(null)
    setAddress(null)
    setIsConnected(false)
    setIsCorrectNetwork(false)
    setShowSuccessAnimation(false)
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else if (accounts[0] !== address) {
      setAddress(accounts[0])
    }
  }

  const handleChainChanged = async () => {
    if (window.ethereum) {
      await checkNetwork(window.ethereum)
    }
  }

  return (
    <WalletContext.Provider 
      value={{ 
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
      }}
    >
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

