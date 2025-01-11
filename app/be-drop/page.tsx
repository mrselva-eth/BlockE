'use client'

import { withWalletProtection } from '@/components/withWalletProtection'
import Image from 'next/image'

function BEDrop() {
  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/bedrop.gif"
          alt="BE Drop Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </div>
      <div className="relative z-10 text-center p-8 max-w-lg mx-auto">
        <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to BE Drop
          </h3>
          <p className="text-gray-700">
            BE Drop features are coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default withWalletProtection(BEDrop)

