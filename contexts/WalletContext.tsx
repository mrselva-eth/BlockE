'use client'

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
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

  const checkNetwork = useCallback(async (provider: any) => {
    if (provider.request) {
      const chainId = await provider.request({ method: 'eth_chainId' })
      const isCorrect = chainId === ETH_MAINNET_CHAIN_ID
      setIsCorrectNetwork(isCorrect)
      return isCorrect
    }
    return false
  }, [])

  const disconnectWallet = useCallback(() => {
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

  const connectWallet = useCallback(async (providerType: string, isAutoConnect: boolean = false) => {
    try {
      let provider;
      switch (providerType) {
        case 'metamask':
          if (typeof window !== 'undefined' && window.ethereum) {
            // Check if MetaMask is installed and accessible
            if (window.ethereum.isMetaMask) {
              provider = window.ethereum;
            } else {
              throw new Error("MetaMask is not installed or not accessible");
            }
          } else {
            throw new Error("Ethereum object not found. Please install MetaMask.");
          }
          break;
        case 'coinbase':
          // Implement Coinbase Wallet connection logic here
          throw new Error("Coinbase Wallet connection not implemented");
        default:
          throw new Error("Unsupported wallet type");
      }

      if (!provider) {
        throw new Error("No provider available");
      }

      // Ensure that the provider is ready before proceeding
      if (typeof provider.request !== 'function') {
        throw new Error("Provider is not ready or doesn't have expected methods");
      }

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);
      setShowWalletModal(false);
      if (!isAutoConnect) {
        setShowSuccessAnimation(true);
      }
      
      if (provider.on) {
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleChainChanged);
      }

      // Check network after successful connection
      await checkNetwork(provider);

      // Save connection info to local storage
      localStorage.setItem('walletConnection', JSON.stringify({ providerType, address }));

    } catch (error: any) {
      console.error("Failed to connect:", error);
      if (error.message.includes("User rejected the request")) {
        console.log("User rejected the wallet connection request");
      } else {
        disconnectWallet();
      }
      throw error;
    }
  }, [checkNetwork])

  const isWalletReady = useCallback(async (provider: any): Promise<boolean> => {
    if (!provider) return false;
    
    try {
      await provider.request({ method: 'eth_accounts' });
      return true;
    } catch (error) {
      console.error("Wallet is not ready:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const isReady = await isWalletReady(window.ethereum);
        if (isReady) {
          const savedConnection = localStorage.getItem('walletConnection');
          if (savedConnection) {
            const { providerType } = JSON.parse(savedConnection);
            connectWallet(providerType, true);
          }
        } else {
          console.log("Wallet is not ready yet. Retrying in 1 second...");
          setTimeout(initializeWallet, 1000);
        }
      }
    };

    initializeWallet();

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [connectWallet, isWalletReady])

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

