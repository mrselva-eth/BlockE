'use client'

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react'
import { ethers } from 'ethers'

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
  isAutoDisconnectEnabled: boolean
  toggleAutoDisconnect: (enabled: boolean) => Promise<void>
  theme: string
  setTheme: (theme: string) => void
  showDisconnectAnimation: boolean
  setShowDisconnectAnimation: (show: boolean) => void
  lastActivityTime: number
  updateLastActivityTime: () => void
  showDisconnectAlert: boolean
  setShowDisconnectAlert: (show: boolean) => void
  resetAutoDisconnectTimer: (callback?: () => void) => void
  showNetworkAlert: boolean;
  showNetworkSwitchAlert: () => void;
  hideNetworkSwitchAlert: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const POLYGON_CHAIN_ID = '0x89'

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [theme, setTheme] = useState('light')
  const [showDisconnectAnimation, setShowDisconnectAnimation] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showDisconnectAlert, setShowDisconnectAlert] = useState<boolean>(false)
  const [initialLoad, setInitialLoad] = useState(true); // Add initialLoad state
  const [showNetworkAlert, setShowNetworkAlert] = useState(false)
  const [isAutoDisconnectEnabled, setIsAutoDisconnectEnabled] = useState(true);


  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  const startTimer = useCallback(
    (callback: () => void) => {
      return setTimeout(() => {
        const now = Date.now()
        if (now - lastActivity >= INACTIVITY_TIMEOUT) {
          callback()
        }
      }, INACTIVITY_TIMEOUT - (Date.now() - lastActivity))
    },
    [lastActivity]
  )

  const resetAutoDisconnectTimer = useCallback(
    (callback?: () => void) => {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
      }

      if (isAutoDisconnectEnabled && isConnected) {
        disconnectTimerRef.current = startTimer(() => {
          if (isAutoDisconnectEnabled && isConnected) {
            setShowDisconnectAlert(true);
            if (callback) {
              callback();
            }
          }
        });
      }
    },
    [isAutoDisconnectEnabled, isConnected, setShowDisconnectAlert, startTimer]
  );

  const toggleAutoDisconnect = useCallback(async (enabled: boolean) => {
    if (!address) return

    try {
      const response = await fetch('/api/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, autoDisconnect: enabled, theme }),
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      setIsAutoDisconnectEnabled(enabled)
      localStorage.setItem('autoDisconnectEnabled', JSON.stringify(enabled))

      if (enabled) {
        resetAutoDisconnectTimer();
      } else if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
      }
    } catch (error) {
      console.error('Error updating auto-disconnect preference:', error)
      // Handle the error, potentially revert the toggle or display a message
    }
  }, [address, theme])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isConnected && isAutoDisconnectEnabled) {
      timer = startTimer(() => {
        setShowDisconnectAlert(true)
      })
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isConnected, isAutoDisconnectEnabled, startTimer, setShowDisconnectAlert, lastActivity])


  const updateLastActivityTime = useCallback(() => {
    resetTimer() 
  }, [resetTimer])


  const checkNetwork = useCallback(async (provider: any) => {
    if (provider.request) {
      const chainId = await provider.request({ method: 'eth_chainId' })
      return chainId === POLYGON_CHAIN_ID
    }
    return false
  }, [])

  const disconnectWallet = useCallback(() => {
    setShowDisconnectAnimation(true)

    setTimeout(() => {
      setSigner(null)
      setAddress(null)
      setIsConnected(false)
      setShowSuccessAnimation(false)
      setShowDisconnectAlert(false)
      setShowNetworkAlert(false)
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current)
      }
      localStorage.removeItem('walletConnection')

      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners()
      }

      setShowDisconnectAnimation(false)
    }, 0)
  }, [])

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else if (accounts[0] !== address) {
      setAddress(accounts[0])
      const savedConnection = localStorage.getItem('walletConnection')
      if (savedConnection) {
        const { providerType } = JSON.parse(savedConnection)
        localStorage.setItem('walletConnection', JSON.stringify({ providerType, address: accounts[0] }))
      }
    }
  }, [address, disconnectWallet])

  const handleChainChanged = useCallback(async (chainId: string) => {
    if (window.ethereum) {
      const isCorrect = await checkNetwork(window.ethereum)
    }
  }, [checkNetwork])

  const setupNetworkChangeListener = useCallback(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        if (chainId !== POLYGON_CHAIN_ID) {
          showNetworkSwitchAlert()
        } else {
          hideNetworkSwitchAlert()
        }
      })
    }
  }, [])

  const connectWallet = useCallback(async (providerType: string, isAutoConnect: boolean = false) => {
    try {
      let provider
      switch (providerType) {
        case 'metamask':
          if (typeof window !== 'undefined' && window.ethereum) {
            if (window.ethereum.isMetaMask) {
              provider = window.ethereum
            } else {
              throw new Error("MetaMask is not installed or not accessible")
            }
          } else {
            throw new Error("Ethereum object not found. Please install MetaMask.")
          }
          break
        case 'coinbase':
          throw new Error("Coinbase Wallet connection not implemented")
        default:
          throw new Error("Unsupported wallet type")
      }

      if (!provider) {
        throw new Error("No provider available")
      }

      // Check for and handle pending requests
      if (provider._state.accounts && provider._state.accounts.length > 0) {
        // Accounts are already available, resolve immediately
        const ethersProvider = new ethers.BrowserProvider(provider)
        const newSigner = await ethersProvider.getSigner()
        const newAddress = await newSigner.getAddress()
        setSigner(newSigner)
        setAddress(newAddress)
        setIsConnected(true)
        setShowWalletModal(false)
        if (!isAutoConnect) {
          setShowSuccessAnimation(true)
        }
        resetAutoDisconnectTimer()

        const isCorrectNetwork = await checkNetwork(provider)
        if (!isCorrectNetwork) {
          showNetworkSwitchAlert() 
        }

        provider.on('accountsChanged', handleAccountsChanged)
        provider.on('chainChanged', (chainId: string) => {
          handleChainChanged(chainId)
        })

        localStorage.setItem('walletConnection', JSON.stringify({ providerType, address: newAddress }))
        return;
      } else if (provider._state.isUnlocked === false) {
        // Wallet is locked, prompt user to unlock
        throw new Error("Please unlock your MetaMask wallet.")
      }

      // Request accounts and handle potential pending requests
      await provider.request({ method: 'eth_requestAccounts' }).catch((error: any) => {
        if (error.code === -32002) {
          // Pending request, let MetaMask handle it
          console.warn("MetaMask request already pending. Awaiting user response.")
          throw error // Re-throw to prevent further execution
        } else if (error.code === 4001) {
          // User rejected
          throw new Error("User rejected the request.")
        } else {
          throw new Error("An unexpected error occurred.")
        }
      })

      const ethersProvider = new ethers.BrowserProvider(provider)
      const newSigner = await ethersProvider.getSigner()
      const newAddress = await newSigner.getAddress()

      setSigner(newSigner)
      setAddress(newAddress)
      setIsConnected(true)
      setShowWalletModal(false)
      if (!isAutoConnect) {
        setShowSuccessAnimation(true)
      }
      resetAutoDisconnectTimer()

      const isCorrectNetwork = await checkNetwork(provider)
      if (!isCorrectNetwork) {
        showNetworkSwitchAlert() 
      }

      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', (chainId: string) => {
        handleChainChanged(chainId)
      })

      localStorage.setItem('walletConnection', JSON.stringify({ providerType, address: newAddress }))

    } catch (error: any) {
      console.error("Failed to connect:", error)
      if (error.code === -32002) {
        alert('You have a pending wallet connection request. Please check MetaMask.')
      } else if (error.message.includes("User rejected the request")) {
        console.log("User rejected the wallet connection request")
      } else {
        alert(error.message || 'An unexpected error occurred during wallet connection. Please try again.')
        disconnectWallet()
      }
    }
  }, [checkNetwork, handleAccountsChanged, handleChainChanged, resetAutoDisconnectTimer, disconnectWallet])

  const isWalletReady = useCallback(async (provider: any): Promise<boolean> => {
    if (!provider) return false

    try {
      await provider.request({ method: 'eth_accounts' })
      return true
    } catch (error) {
      console.error("Wallet is not ready:", error)
      return false
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

  const switchNetwork = useCallback(async () => {
  }, [])

  const showNetworkSwitchAlert = useCallback(() => {
    setShowNetworkAlert(true)
  }, [])

  const hideNetworkSwitchAlert = useCallback(() => {
    setShowNetworkAlert(false)
  }, [])

  useEffect(() => {
    const initialize = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const isReady = await isWalletReady(window.ethereum)
        if (isReady) {
          const savedConnection = localStorage.getItem('walletConnection')

          // Check if already connected and on a page other than home
          if (savedConnection && window.location.pathname !== '/') {
            setInitialLoad(false); // Prevent redirect on initial load if already connected
          }

          if (savedConnection) {
            const { providerType } = JSON.parse(savedConnection)
            connectWallet(providerType, true)
          }
          setupNetworkChangeListener()
        } else {
          console.log("Wallet is not ready yet. Retrying in 1 second...")
          setTimeout(initialize, 1000)
        }
      }
    }

    initialize()

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [connectWallet, isWalletReady, setupNetworkChangeListener])


  useEffect(() => {
    const fetchTheme = async () => {
      if (address) {
        try {
          const response = await fetch(`/api/get-theme?address=${address}`)
          const data = await response.json()
          if (data.theme) {
            setTheme(data.theme)
          }
        } catch (error) {
          console.error('Failed to fetch theme:', error)
        }
      }
    }

    fetchTheme()
  }, [address])

  useEffect(() => {
    const handleActivity = () => {
      updateLastActivityTime() 
      if (showDisconnectAlert) {
        setShowDisconnectAlert(false) 
      }
      resetAutoDisconnectTimer()
    }

    if (isConnected) {
      window.addEventListener('mousemove', handleActivity)
      window.addEventListener('keydown', handleActivity)
      return () => {
        window.removeEventListener('mousemove', handleActivity)
        window.removeEventListener('keydown', handleActivity)
      }
    }
  }, [isConnected, isAutoDisconnectEnabled, updateLastActivityTime, resetAutoDisconnectTimer, showDisconnectAlert]) 

  useEffect(() => {
    const savedAutoDisconnect = localStorage.getItem('autoDisconnectEnabled')
    if (savedAutoDisconnect !== null) {
      setIsAutoDisconnectEnabled(JSON.parse(savedAutoDisconnect))
    }
  }, [])

  useEffect(() => {
    if (isConnected) {
      resetAutoDisconnectTimer()
    }

    return () => {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current)
      }
    }
  }, [isConnected, isAutoDisconnectEnabled, resetAutoDisconnectTimer])


  const contextValue: WalletContextType = {
    signer,
    address,
    isConnected,
    showWalletModal,
    setShowWalletModal,
    connectWallet,
    disconnectWallet,
    verifyCaptcha,
    isCorrectNetwork: false,
    switchNetwork,
    showSuccessAnimation,
    setShowSuccessAnimation,
    isAutoDisconnectEnabled,
    toggleAutoDisconnect,
    theme,
    setTheme,
    showDisconnectAnimation,
    setShowDisconnectAnimation,
    lastActivityTime: lastActivity,
    updateLastActivityTime, 
    showDisconnectAlert,
    setShowDisconnectAlert,
    resetAutoDisconnectTimer,
    showNetworkAlert,
    showNetworkSwitchAlert,
    hideNetworkSwitchAlert,
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

