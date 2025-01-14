'use client'

import React, { PropsWithChildren } from 'react';
import { useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useWallet } from '@/contexts/WalletContext'
import BlockEUIDAlert from './BlockEUIDAlert'
import { useBlockEUID } from '@/hooks/useBlockEUID'

// Type for the wrapped component's props
type WrappedComponentProps<P> = P & { hasUID: boolean };

export function withWalletProtection<P>(
 WrappedComponent: React.ComponentType<WrappedComponentProps<P>>
): React.FC<P> {
 return function ProtectedComponent(props: P) {
   const { isConnected, address } = useWallet()
   const router = useRouter()
   const pathname = usePathname()
   const { ownedUIDs, isLoading } = useBlockEUID()
   const [showAlert, setShowAlert] = useState(false)

   const shouldRedirect = useMemo(() => {
     // Only redirect if NOT connected and NOT on home page AND not loading UIDs
     return !isConnected && pathname !== '/' && !isLoading;
   }, [isConnected, pathname, isLoading])

   useEffect(() => {
     if (shouldRedirect) {
       router.push('/')
     } else if (!isLoading && ownedUIDs.length === 0 && pathname !== '/' && pathname !== '/blocke-uid') {
       setShowAlert(true); // Show alert if no UIDs and not on protected pages
     }
   }, [shouldRedirect, router, ownedUIDs, isLoading, pathname])

   if (!isConnected && pathname !== '/') {
     // Redirect immediately if not connected and not on home page, no need for useEffect here
     return null;
   }

   if (!isConnected && pathname !== '/') { // Only show loading if not connected and not on home page
     // Show loading indicator while checking connection or UIDs
     return <div>Loading...</div>
   }

   if (showAlert) {
     return <BlockEUIDAlert />
   }

   // Pass hasUID prop to the wrapped component
   return <WrappedComponent {...props} hasUID={ownedUIDs.length > 0} />;
 }
}

