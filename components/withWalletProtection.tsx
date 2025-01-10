'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/contexts/WalletContext'
import BlockEUIDAlert from './BlockEUIDAlert'
import { useBlockEUID } from '@/hooks/useBlockEUID'

export function withWalletProtection<T extends JSX.IntrinsicAttributes>(WrappedComponent: React.ComponentType<T>) {
  return function ProtectedComponent(props: T) {
    const { isConnected, address } = useWallet()
    const router = useRouter()
    const { ownedUIDs, isLoading } = useBlockEUID()
    const [showAlert, setShowAlert] = useState(false)

    useEffect(() => {
      if (!isConnected) {
        router.push('/')
      } else if (!isLoading) {
        setShowAlert(ownedUIDs.length === 0)
      }
    }, [isConnected, router, ownedUIDs, isLoading])

    if (!isConnected) {
      return null
    }

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (showAlert) {
      return <BlockEUIDAlert />
    }

    return <WrappedComponent {...props} />
  }
}

