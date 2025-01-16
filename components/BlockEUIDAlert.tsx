import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

const BlockEUIDAlert: React.FC = () => {
  const router = useRouter()
  const [showAlert, setShowAlert] = useState(true);

  const handleClose = () => {
    setShowAlert(false);
  };

  if (!showAlert) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }} // Initial animation state
        animate={{ opacity: 1, y: 0 }} // Final animation state
        exit={{ opacity: 0, y: -20 }} // Exit animation state
        transition={{ duration: 0.3 }} // Animation duration
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" // Added backdrop blur
      >
        <div className="relative w-full max-w-sm mx-auto">
          <motion.div
            initial={{ scale: 0.95 }} // Initial scale
            animate={{ scale: 1 }} // Final scale
            exit={{ scale: 0.95 }} // Exit scale
            transition={{ duration: 0.3 }} // Animation duration
            className="bg-white/95 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl p-6 text-center relative border border-purple-200 dark:border-purple-800"
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Close alert" // Add aria-label for accessibility
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <AlertTriangle className="mx-auto mb-4 text-yellow-500 h-12 w-12" size={48} />
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">BlockE UID Required</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You need a BlockE UID to access this page. BlockE UID is the key to unlock all features of the BlockE project.
            </p>
            <button
              onClick={() => router.push('/blocke-uid')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium hover:from-purple-600 hover:to-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Get BlockE UID
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BlockEUIDAlert

