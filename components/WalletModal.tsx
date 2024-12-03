'use client'

import { useRef } from 'react'
import Image from 'next/image'
import ReCAPTCHA from 'react-google-recaptcha'
import { useWallet } from '@/contexts/WalletContext'
import { X } from 'lucide-react'

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

  const handleWalletClick = async (walletId: string) => {
    const token = await recaptchaRef.current?.executeAsync()
    if (token !== undefined) {
      const isVerified = await verifyCaptcha(token)
    
      if (isVerified) {
        try {
          await connectWallet(walletId)
        } catch (error) {
          console.error('Failed to connect wallet:', error)
        }
      }
    } else {
      console.error('Failed to execute reCAPTCHA')
    }
  }

  if (!showWalletModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Select your wallet</h2>
          <button
            onClick={() => setShowWalletModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
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

        <ReCAPTCHA
          ref={recaptchaRef}
          size="invisible"
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        />
      </div>
    </div>
  )
}

