'use client'

import AnimationWrapper from './WalletConnectedAnimation'
import { useWallet } from '@/contexts/WalletContext'

export default function WalletComponentsWrapper() {
  const { isConnected } = useWallet()

  return <>{isConnected && <AnimationWrapper onAnimationComplete={() => {}} />}</>;
}

