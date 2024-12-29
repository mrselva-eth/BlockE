'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import WalletModal from '../components/WalletModal'
import SocialMediaLinks from '../components/SocialMediaLinks'
import { useWallet } from '@/contexts/WalletContext'
import { ChevronDown, Zap, Binary, Bot, BarChart2, Shield, ArrowRight, MousePointer } from 'lucide-react'
import ScrollIndicator from '@/components/ScrollIndicator'
import FeatureCard from '@/components/FeatureCard'
import SectionTitle from '@/components/SectionTitle'
import FloatingParticles from '@/components/FloatingParticles'
import ThemeToggle from '@/components/ThemeToggle'
import ScrollSection from '@/components/ScrollSection'
import RoadmapSection from '@/components/RoadmapSection'
import NewsletterSection from '@/components/NewsletterSection'
import BlockEFooter from '@/components/BlockEFooter'
import FeatureSection from '@/components/FeatureSection'

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * (end - start) + start));

      if (progress === 1) {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function Home() {
  const { isConnected, setShowWalletModal } = useWallet()
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const handleConnectWallet = () => {
    setShowWalletModal(true)
  }

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0])
  const heroContentY = useTransform(scrollYProgress, [0, 0.5], ['0%', '50%'])

  const mousePositionRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const [darkMode, setDarkMode] = useState(false)

  const handleThemeChange = (isDark: boolean) => {
    setDarkMode(isDark)
  }


  const lightBackgroundImage = "/blockchain-background.gif"
  const darkBackgroundImage = "/dark-blockchain-background.gif"

  return (
    <div ref={containerRef} className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden transition-colors duration-200">
      {isConnected && <Sidebar />}
      <main className="relative z-10">
        <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 z-0"
            style={{ y: backgroundY, opacity }}
          >
            <Image
              src={darkMode ? darkBackgroundImage : lightBackgroundImage}
              alt="Hero Background"
              layout="fill"
              objectFit="cover"
              quality={100}
              priority
            />
          </motion.div>
          <motion.div 
            className="max-w-4xl relative z-10"
            style={{ y: heroContentY }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="flex flex-col items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Image
                src="/blocke-logo.png"
                alt="BlockE Logo"
                width={120}
                height={120}
                className="mb-4"
              />
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-800 dark:text-gray-100 font-space-grotesk bg-clip-text text-transparent bg-gradient-to-r from-blockchain-blue to-blockchain-purple">
                BlockE
              </h1>
            </motion.div>
            <motion.p 
              className="text-xl sm:text-2xl mb-8 text-gray-700 dark:text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Your gateway to the decentralized future
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col items-center space-y-4"
            >
              {!isConnected && (
                <motion.button 
                  onClick={handleConnectWallet}
                  className="px-8 py-3 bg-gradient-to-r from-blockchain-blue to-blockchain-purple text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Connect Wallet
                </motion.button>
              )}
              <ThemeToggle onThemeChange={handleThemeChange} />
            </motion.div>
          </motion.div>
          <FloatingParticles />

          <motion.div
            className="hidden md:block fixed w-20 h-20 rounded-full bg-gradient-to-r from-blockchain-blue to-blockchain-purple opacity-20 pointer-events-none"
            animate={{
              x: mousePositionRef.current.x,
              y: mousePositionRef.current.y,
            }}
            transition={{ type: 'spring', damping: 10, stiffness: 50 }}
          />
        </section>

        <ScrollIndicator />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollSection className="py-20 bg-gradient-to-br from-blockchain-blue/5 to-blockchain-purple/5 dark:from-blockchain-blue/10 dark:to-blockchain-purple/10 backdrop-blur-md rounded-xl my-8">
            <div className="container mx-auto px-4">
              <SectionTitle>Discover BlockE Features</SectionTitle>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <FeatureCard 
                  icon={Zap} 
                  title="BlockE UID" 
                  description="Unique blockchain identifiers for your digital identity" 
                  howToUse={[
                    "Connect your wallet",
                    "Navigate to the BlockE UID page",
                    "Choose a unique identifier",
                    "Mint your BlockE UID",
                    "Use your UID across the BlockE ecosystem"
                  ]}
                  color="from-blue-400 to-indigo-600"
                />
                <FeatureCard 
                  icon={Binary} 
                  title="CW²" 
                  description="Advanced crypto wallet management and messaging" 
                  howToUse={[
                    "Access the CW² interface",
                    "Add contacts or join groups",
                    "Send encrypted messages",
                    "Manage your crypto assets",
                    "Enjoy secure, decentralized communication"
                  ]}
                  color="from-purple-400 to-pink-600"
                />
                <FeatureCard 
                  icon={Shield} 
                  title="BE Staking" 
                  description="Earn rewards by staking BE tokens" 
                  howToUse={[
                    "Navigate to the BE Staking page",
                    "Connect your wallet",
                    "Choose the amount to stake",
                    "Select a staking period",
                    "Confirm the transaction and start earning"
                  ]}
                  color="from-green-400 to-teal-600"
                />
                <FeatureCard 
                  icon={Bot} 
                  title="BlockE AI" 
                  description="AI-powered blockchain assistant for insights and analysis" 
                  howToUse={[
                    "Access the BlockE AI interface",
                    "Ask questions or request analysis",
                    "Receive AI-generated insights",
                    "Explore blockchain data with AI assistance",
                    "Make informed decisions based on AI recommendations"
                  ]}
                  color="from-red-400 to-orange-600"
                />
                <FeatureCard 
                  icon={BarChart2} 
                  title="Analytics Dashboard" 
                  description="Comprehensive blockchain analytics and visualization" 
                  howToUse={[
                    "Log in to your BlockE account",
                    "Navigate to the Analytics Dashboard",
                    "Select desired metrics and timeframes",
                    "Analyze trends and patterns",
                    "Export or share your findings"
                  ]}
                  color="from-yellow-400 to-amber-600"
                />
              </motion.div>
            </div>
          </ScrollSection>

          {/* BlockE UID Section */}
          <ScrollSection className="bg-gradient-to-r from-blockchain-blue/10 to-blockchain-purple/10 dark:from-blockchain-blue/20 dark:to-blockchain-purple/20 rounded-xl my-12 px-6">
            <FeatureSection
              title="BlockE UID"
              description="Secure your unique blockchain identity with BlockE UID. Mint your personalized identifier and take control of your Web3 presence."
              ctaText="Get Your BlockE UID"
              ctaLink="/blocke-uid"
              imageSrc="/blocke-uid-preview.png"
              imageAlt="BlockE UID Preview"
              variant="purple"
            />
          </ScrollSection>

          {/* CW² Section */}
          <ScrollSection className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl my-12 px-6">
            <FeatureSection
              title="CW² (Crypto Wallet 2)"
              description="Experience the next generation of crypto wallet management. Send messages, create groups, and manage your assets with ease."
              ctaText="Explore CW²"
              ctaLink="/cw2"
              imageSrc="/cw2-preview.png"
              imageAlt="CW² Preview"
              variant="teal"
            />
          </ScrollSection>

          {/* BE Staking Section */}
          <ScrollSection className="bg-gradient-to-r from-blockchain-blue/10 to-blockchain-purple/10 dark:from-blockchain-blue/20 dark:to-blockchain-purple/20 rounded-xl my-12 px-6">
            <FeatureSection
              title="BE Staking"
              description="Maximize your BE token holdings through our staking program. Earn rewards and participate in the BlockE ecosystem."
              ctaText="Start Staking"
              ctaLink="/be-staking"
              imageSrc="/be-staking-preview.png"
              imageAlt="BE Staking Preview"
              variant="purple"
            />
          </ScrollSection>

          {/* BlockE AI Section */}
          <ScrollSection className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl my-12 px-6">
            <FeatureSection
              title="BlockE AI"
              description="Get instant answers to your blockchain and crypto questions with our AI-powered assistant. Stay informed and make better decisions."
              ctaText="Chat with BlockE AI"
              ctaLink="/blocke-ai"
              imageSrc="/blocke-ai-preview.png"
              imageAlt="BlockE AI Preview"
              variant="teal"
            />
          </ScrollSection>

          <ScrollSection className="bg-gradient-to-r from-blockchain-blue/10 to-blockchain-purple/10 dark:from-blockchain-blue/20 dark:to-blockchain-purple/20 rounded-xl my-8">
            <div className="container mx-auto px-4 text-center">
              <SectionTitle>Powerful Analytics Dashboard</SectionTitle>
              <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
                Get comprehensive insights into blockchain activities, token holdings, and market trends with our intuitive dashboard.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <Image 
                  src="/dashboard-preview.png" 
                  alt="Dashboard Preview" 
                  width={1000} 
                  height={600} 
                  className="rounded-lg shadow-2xl"
                />
                <motion.div 
                  className="absolute -top-8 -left-8 w-24 h-24 bg-blockchain-blue rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
                <motion.div 
                  className="absolute -bottom-8 -right-8 w-20 h-20 bg-blockchain-purple rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: -360 
                  }}
                  transition={{ 
                    duration: 6,
                    delay: 3,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              </motion.div>
            </div>
          </ScrollSection>

          <ScrollSection className="my-8">
            <NewsletterSection />
          </ScrollSection>

          <ScrollSection className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl mb-24">
            <div className="container mx-auto px-4">
              <SectionTitle>BlockE in Numbers</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <motion.div 
                  className="bg-gradient-to-br from-blockchain-blue to-blockchain-purple p-6 rounded-lg shadow-lg text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-2xl font-bold mb-2">Total Users</h3>
                  <p className="text-4xl font-bold"><AnimatedNumber value={100000} />+</p>
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-br from-future-cyan to-future-green p-6 rounded-lg shadow-lg text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="text-2xl font-bold mb-2">BE Tokens Staked</h3>
                  <p className="text-4xl font-bold"><AnimatedNumber value={5000000} /> BE</p>
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-br from-blockchain-blue to-blockchain-purple p-6 rounded-lg shadow-lg text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold mb-2">Daily Transactions</h3>
                  <p className="text-4xl font-bold"><AnimatedNumber value={50000} />+</p>
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-br from-future-cyan to-future-green p-6 rounded-lg shadow-lg text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold mb-2">AI Queries Answered</h3>
                  <p className="text-4xl font-bold"><AnimatedNumber value={1000000} />+</p>
                </motion.div>
              </div>
            </div>
          </ScrollSection>

          <ScrollSection className="bg-gradient-to-r from-blockchain-blue/10 to-blockchain-purple/10 dark:from-blockchain-blue/20 dark:to-blockchain-purple/20 rounded-xl my-12 px-6">
            <RoadmapSection />
          </ScrollSection>
        </div>

        <BlockEFooter />
      </main>
      <WalletModal />
      <SocialMediaLinks />
    </div>
  )
}

