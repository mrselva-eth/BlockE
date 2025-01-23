"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useWallet } from "@/contexts/WalletContext"

const POLYGON_CHAIN_ID = "0x89"

export default function NetworkSwitchAlert() {
  const { showNetworkAlert, hideNetworkSwitchAlert } = useWallet()

  const switchNetwork = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_CHAIN_ID }],
      })
      hideNetworkSwitchAlert()
    } catch (error) {
      console.error("Failed to switch network:", error)
    }
  }

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        if (chainId !== POLYGON_CHAIN_ID) {
          // Show alert if not on Polygon network
          // This will handle the case when user switches to a non-Polygon network
        }
      }
    }

    checkNetwork()

    if (window.ethereum) {
      window.ethereum.on("chainChanged", checkNetwork)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", checkNetwork)
      }
    }
  }, [])

  if (!showNetworkAlert) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          <div className="text-center">
            <Image src="/polygon.png" alt="Polygon logo" width={80} height={80} className="mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Switch to Polygon Network</h2>
            <p className="text-gray-600 mb-6">
              This application requires you to be connected to the Polygon network. Please switch your network to
              continue.
            </p>
            <button
              onClick={switchNetwork}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:from-purple-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Switch to Polygon
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Add Polygon Network using Chainlist:{" "}
              <a
                href="https://chainlist.org/chain/137"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 underline"
              >
                https://chainlist.org/chain/137
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

