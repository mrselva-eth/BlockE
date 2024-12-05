'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import ReCAPTCHA from 'react-google-recaptcha'
import { useWallet } from '@/contexts/WalletContext'
import { X, AlertTriangle } from 'lucide-react'

const wallets = [
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: '/wallets/coinbase.png'
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/wallets/metamask.png'
  },
  {
    id: 'okx',
    name: 'OKX',
    icon: '/wallets/okx.png'
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '/wallets/trust.png'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.png'
  }
]

export default function WalletModal() {
  const { showWalletModal, setShowWalletModal, connectWallet, verifyCaptcha } = useWallet()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [error, setError] = useState<string | null>(null)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (showWalletModal) {
      setCaptchaVerified(false)
      setError(null)
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }
    }
  }, [showWalletModal])

  const handleCaptchaChange = async (token: string | null) => {
    setError(null)
    
    if (!token) {
      setError('Please complete the CAPTCHA verification')
      return
    }

    try {
      const isVerified = await verifyCaptcha(token)
      if (isVerified) {
        setCaptchaVerified(true)
      } else {
        setError('CAPTCHA verification failed')
        recaptchaRef.current?.reset()
      }
    } catch (error) {
      console.error('Failed to verify CAPTCHA:', error)
      setError('Failed to verify CAPTCHA. Please try again.')
      recaptchaRef.current?.reset()
    }
  }

  const handleWalletClick = async (walletId: string) => {
    setError(null)
    try {
      await connectWallet(walletId)
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      if (error.message.includes('User rejected the request')) {
        setError('Connection cancelled by user. Please try again.')
      } else {
        setError(error.message || 'Failed to connect wallet. Please try again.')
      }
    }
  }

  if (!showWalletModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <button
            onClick={() => setShowWalletModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle size={18} className="text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!captchaVerified ? (
          <div className="text-center">
            <p className="mb-4">Please verify that you are not a robot before connecting your wallet.</p>
            <div className="flex justify-center mb-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey || ''}
                onChange={handleCaptchaChange}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Choose your preferred wallet to connect
            </p>
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletClick(wallet.id)}
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
              >
                <Image
                  src={wallet.icon}
                  alt={wallet.name}
                  width={32}
                  height={32}
                  className="mr-4"
                />
                <span className="text-lg font-medium">{wallet.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

