'use client'

import { usePathname } from 'next/navigation'
import CryptoStatsTicker from './CryptoStatsTicker'

export default function ConditionalCryptoStatsTicker() {
  const pathname = usePathname()

  if (pathname !== '/') {
    return null
  }

  return (
    <div className="w-full absolute top-0 left-0 right-0 z-20">
      <CryptoStatsTicker />
    </div>
  )
}

