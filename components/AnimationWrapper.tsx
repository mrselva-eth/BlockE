'use client'

import { useWallet } from '@/contexts/WalletContext'
import WalletConnectedAnimation from './WalletConnectedAnimation'

export default function AnimationWrapper() {
  const { showSuccessAnimation, setShowSuccessAnimation } = useWallet()

  return showSuccessAnimation ? (
    <WalletConnectedAnimation onAnimationComplete={() => setShowSuccessAnimation(false)} />
  ) : null
}

