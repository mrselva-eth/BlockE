'use client'

import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

declare module 'react-google-recaptcha';

interface WalletContextType {
  signer: ethers.Signer | null
  address: string | null
  isConnected: boolean
  showWalletModal: boolean
  setShowWalletModal: (show: boolean) => void
  connectWallet: (providerType: string) => Promise<void>
  disconnectWallet: () => void
  verifyCaptcha: (token: string | null) => Promise<boolean>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "BlockE",
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID
    }
  },
  // Remove the walletconnect option for now
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
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

  const verifyCaptcha = async (token: string | null): Promise<boolean> => {
    if (!token) return false
    
    try {
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('CAPTCHA verification failed:', error)
      return false
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
      
      if (provider.on) {
        provider.on('accountsChanged', handleAccountsChanged)
        provider.on('chainChanged', handleChainChanged)
      }
    } catch (error) {
      console.error("Failed to connect:", error)
      disconnectWallet()
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

  const handleChainChanged = () => {
    window.location.reload()
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
        verifyCaptcha
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

