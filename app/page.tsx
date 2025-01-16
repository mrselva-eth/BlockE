'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import WalletModal from '../components/WalletModal'
import SocialMediaLinks from '../components/SocialMediaLinks'
import { useWallet } from '@/contexts/WalletContext'
import { ChevronDown, Zap, Binary, Bot, BarChart2, Coins, Gift, Shield } from 'lucide-react'
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
import ConditionalCryptoStatsTicker from '@/components/ConditionalCryptoStatsTicker'
import Loader from '@/components/Loader'; // Import Loader component
import AnnouncementAlert from '@/components/AnnouncementAlert'; // Import the component


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
const { isConnected, setShowWalletModal, theme, loggedOut, setLoggedOut } = useWallet()
const [scrollY, setScrollY] = useState(0)
const containerRef = useRef<HTMLDivElement>(null)
const { scrollYProgress } = useScroll({
 target: containerRef,
 offset: ["start start", "end start"]
})

const handleConnectWallet = () => {
setShowWalletModal(true)
}

const [totalUsers, setTotalUsers] = useState(0);
const [beTokensStaked, setBeTokensStaked] = useState(0);
//const [beTokensClaimed, setBeTokensClaimed] = useState(0); //Removed
const [aiQueriesAnswered, setAiQueriesAnswered] = useState(0);
const [statsLoading, setStatsLoading] = useState(true); // Add loading state
const [beTokensMinted, setBeTokensMinted] = useState(0) // New state
const [blockeUIDMinted, setBlockeUIDMinted] = useState(0) // New state

useEffect(() => {
 const handleScroll = () => {
   if (isConnected) {
     requestAnimationFrame(() => {
       setScrollY(window.scrollY)
     })
   }
 }
 window.addEventListener('scroll', handleScroll)
 return () => window.removeEventListener('scroll', handleScroll)
}, [isConnected])

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


const lightBackgroundImage = "/blockchain-background.gif"
const darkBackgroundImage = "/dark-blockchain-background.gif"

// Prevent scrolling when not connected
useEffect(() => {
 if (!isConnected) {
   document.body.style.overflow = 'hidden'
 } else {
   document.body.style.overflow = 'unset'
 }
 return () => {
   document.body.style.overflow = 'unset'
 }
}, [isConnected])

useEffect(() => {
 const fetchStats = async () => {
   try {
     setStatsLoading(true); // Set loading state to true

     const [
       totalUsersResponse,
       beTokensStakedResponse,
       //beTokensClaimedResponse, //Removed
       aiQueriesAnsweredResponse,
       beTokensMintedResponse,
       blockeUIDMintedResponse,
     ] = await Promise.all([
       fetch('/api/total-users'),
       fetch('/api/total-staked'),
       //fetch('/api/total-claimed'), //Removed
       fetch('/api/total-ai-queries'),
       fetch('/api/total-minted'), // New API route
       fetch('/api/total-uid-minted'), // New API route
     ]);

     const [totalUsersData, beTokensStakedData, aiQueriesAnsweredData, beTokensMintedData, blockeUIDMintedData] =
       await Promise.all([
         totalUsersResponse.json(),
         beTokensStakedResponse.json(),
         aiQueriesAnsweredResponse.json(),
         beTokensMintedResponse.json(),
         blockeUIDMintedResponse.json(),
       ]);

     if (
       !totalUsersResponse.ok ||
       !beTokensStakedResponse.ok ||
       //!beTokensClaimedResponse.ok || //Removed
       !aiQueriesAnsweredResponse.ok ||
       !beTokensMintedResponse.ok ||
       !blockeUIDMintedResponse.ok
     ) {
       throw new Error('Failed to fetch some or all statistics.');
     }

     setTotalUsers(totalUsersData.count);
     setBeTokensStaked(parseFloat(beTokensStakedData.totalStaked));
     //setBeTokensClaimed(parseFloat(beTokensClaimedData.totalClaimed)); //Removed
     setAiQueriesAnswered(aiQueriesAnsweredData.totalQueries);
     setBeTokensMinted(beTokensMintedData.totalMinted) // Set new state
     setBlockeUIDMinted(blockeUIDMintedData.totalMinted) // Set new state
   } catch (error) {
     console.error('Error fetching statistics:', error);
     // Handle error state if needed
   } finally {
     setStatsLoading(false); // Set loading state to false after fetching, regardless of success or failure
   }
 };

 fetchStats();
}, []);


return (
 <div 
   ref={containerRef} 
   className={`min-h-screen bg-white dark:bg-gray-900 relative overflow-x-hidden ${!isConnected ? 'overflow-hidden h-screen' : ''}`}
 >
   {isConnected && <Sidebar />}
   <main className="relative z-10">
     <ConditionalCryptoStatsTicker />
     <AnnouncementAlert /> {/* Added AnnouncementAlert component */}
     <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
       <motion.div 
         className="absolute inset-0 z-0"
         style={{ y: backgroundY, opacity }}
       >
         <Image
           src={theme === 'dark' ? darkBackgroundImage : lightBackgroundImage}
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
           <ThemeToggle />
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

     {isConnected && (
       <>
         <ScrollIndicator />

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <ScrollSection className="py-20 bg-gradient-to-br from-blockchain-blue/5 to-blockchain-purple/5 dark:from-blockchain-blue/10 dark:to-blockchain-purple/10 backdrop-blur-md rounded-xl my-8">
             <div className="container mx-auto px-4">
               <SectionTitle>Discover BlockE Features</SectionTitle>
               <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <FeatureCard 
                   icon={Zap} 
                   title="BlockE UID" 
                   description="Unique blockchain identifiers for your digital identity" 
                   howToUse={[
                     "Connect your wallet",
                     "Navigate to the BlockE UID page via the button in the header",
                     "Mint a BlockE UID by entering a number"
                   ]}
                   color="from-blue-400 to-indigo-600"
                 />
                 <FeatureCard 
                   icon={Binary} 
                   title="CW²" 
                   description="Advanced crypto wallet management and messaging" 
                   howToUse={[
                     "Connect your wallet",
                     "Navigate to the CW² page using the sidebar.",
                     "Add contacts or create/select a group to chat."
                   ]}
                   color="from-purple-400 to-pink-600"
                 />

                  <FeatureCard
                   icon={Shield}
                   title="BE Staking"
                   description="Earn rewards by staking BE tokens"
                   howToUse={[
                     "Navigate to the BE Staking page using the sidebar",
                     "Enter the amount of BE tokens you want to stake.",
                     "Choose a lock-in period (e.g., 15 days, 30 days, etc.).",
                     "Click the Stake button and confirm the transaction in your wallet.",
                     "You can claim your staking rewards after the lock-in period ends."
                   ]}
                   color="from-green-400 to-teal-600"
                  />

                  <FeatureCard 
                   icon={Bot} 
                   title="BlockE AI" 
                   description="AI-powered blockchain assistant for insights and analysis" 
                   howToUse={[
                     "Navigate to BlockE AI page via the sidebar",
                     "Enter your message or command and press send."
                   ]}
                   color="from-red-400 to-orange-600"
                 />
                 <FeatureCard 
                   icon={BarChart2} 
                   title="Analytics Dashboard" 
                   description="Comprehensive blockchain analytics and visualization" 
                   howToUse={[
                     "Connect your wallet",
                     "Navigate to the Dashboard page via the sidebar.",
                     "Search an address to see analytics."
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
               description="Mint your unique, personalized blockchain identifier.  Unlock exclusive features and showcase your Web3 identity."
               ctaText="Get Your BlockE UID"
               ctaLink="/blocke-uid"
               imageSrc="/blocke-uid-preview.png"
               imageAlt="BlockE UID Preview"
               variant="purple"
             />
           </ScrollSection>

           {/* Dashboard Section */}
           <ScrollSection className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl my-12 px-6">
             <FeatureSection
               title="Analytics Dashboard"
               description="Explore comprehensive blockchain analytics and visualizations.  Gain insights into your portfolio, transactions, and more."
               ctaText="Explore the Dashboard"
               ctaLink="/dashboard"
               imageSrc="/dashboard-preview.png"
               imageAlt="Dashboard Preview"
               variant="teal"
             />
           </ScrollSection>

           {/* CW² Section */}
           <ScrollSection className="bg-gradient-to-r from-blockchain-blue/10 to-blockchain-purple/10 dark:from-blockchain-blue/20 dark:to-blockchain-purple/20 rounded-xl my-12 px-6">
             <FeatureSection
               title="CW² (Chat With Wallet)"
               description="Experience decentralized, secure messaging and group chats. Connect with your Web3 contacts seamlessly."
               ctaText="Chat with CW²"
               ctaLink="/cw2"
               imageSrc="/cw2-preview.png"
               imageAlt="CW² Preview"
               variant="purple"
             />
           </ScrollSection>

           {/* BlockE AI Section */}
           <ScrollSection className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl my-12 px-6">
             <FeatureSection
               title="BlockE AI"
               description="Get instant answers to your blockchain and crypto questions.  Our AI-powered assistant provides valuable insights."
               ctaText="Chat with BlockE AI"
               ctaLink="/blocke-ai"
               imageSrc="/blocke-ai-preview.png"
               imageAlt="BlockE AI Preview"
               variant="teal"
             />
           </ScrollSection>

           {/* Cex and Dex Section */}
           <ScrollSection className="bg-gradient-to-r from-blockchain-blue/10 to-blockchain-purple/10 dark:from-blockchain-blue/20 dark:to-blockchain-purple/20 rounded-xl my-12 px-6">
             <FeatureSection
               title="Cex and Dex"
               description="Explore the world of centralized and decentralized exchanges.  Discover new trading opportunities and manage your crypto assets."
               ctaText="Explore Cex and Dex"
               ctaLink="/cex-and-dex"
               imageSrc="/cex-and-dex-preview.png"
               imageAlt="Cex and Dex Preview"
               variant="purple"
             />
           </ScrollSection>

           {/* BE Staking Section */}
           <ScrollSection className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl my-12 px-6">
             <FeatureSection
               title="BE Staking"
               description="Earn rewards by staking your BE tokens.  Participate in the BlockE ecosystem and maximize your returns."
               ctaText="Start Staking"
               ctaLink="/be-staking"
               imageSrc="/be-staking-preview.png"
               imageAlt="BE Staking Preview"
               variant="teal"
             />
           </ScrollSection>

           {/* BE Drop Section */}
           <ScrollSection className="bg-gradient-to-r from-blockchain-blue/10 to-blockchain-purple/10 dark:from-blockchain-blue/20 dark:to-blockchain-purple/20 rounded-xl my-12 px-6">
             <FeatureSection
               title="BE Drop"
               description="Participate in our BE Drop program and earn free BE tokens.  Complete tasks and unlock rewards."
               ctaText="Claim Your BE Drop"
               ctaLink="/be-drop"
               imageSrc="/be-drop-preview.png"
               imageAlt="BE Drop Preview"
               variant="purple"
             />
           </ScrollSection>

           {/* Roadmap Section */}
           <ScrollSection className="bg-gradient-to-r from-blockchain-blue/10 to-blockchain-purple/10 dark:from-blockchain-blue/20 dark:to-blockchain-purple/20 rounded-xl my-12 px-6">
             <RoadmapSection />
           </ScrollSection>

           {/* Newsletter Section */}
           <ScrollSection className="my-8">
             <NewsletterSection />
           </ScrollSection>

           <ScrollSection className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl mb-24">
             <div className="container mx-auto px-4">
               <SectionTitle>BlockE in Numbers</SectionTitle>
               {statsLoading ? ( // Conditionally render loading state
                 <div className="flex justify-center items-center h-24">
                   <Loader size={24} className="text-purple-500" />
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"> {/* Updated grid for 6 items */}
                   <motion.div
                     className="bg-gradient-to-br from-blockchain-blue to-blockchain-purple p-6 rounded-lg shadow-lg text-white"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                   >
                     <h3 className="text-2xl font-bold mb-2">Total Users</h3>
                     <p className="text-4xl font-bold">
                       <AnimatedNumber value={totalUsers} />
                     </p>
                   </motion.div>
                   <motion.div
                     className="bg-gradient-to-br from-future-cyan to-future-green p-6 rounded-lg shadow-lg text-white"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.1 }}
                   >
                     <h3 className="text-2xl font-bold mb-2">BE Tokens Staked</h3>
                     <p className="text-4xl font-bold">
                       <AnimatedNumber value={beTokensStaked} /> BE
                     </p>
                   </motion.div>
                   
                   <motion.div
                     className="bg-gradient-to-br from-future-cyan to-future-green p-6 rounded-lg shadow-lg text-white"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.3 }}
                   >
                     <h3 className="text-2xl font-bold mb-2">AI Queries Answered</h3>
                     <p className="text-4xl font-bold">
                       <AnimatedNumber value={aiQueriesAnswered} />
                     </p>
                   </motion.div>
                   <motion.div // New stat
                     className="bg-gradient-to-br from-future-cyan to-future-green p-6 rounded-lg shadow-lg text-white"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.4 }}
                   >
                     <h3 className="text-2xl font-bold mb-2">BE Tokens Minted</h3>
                     <p className="text-4xl font-bold">
                       <AnimatedNumber value={beTokensMinted} />
                     </p>
                   </motion.div>
                   <motion.div // New stat
                     className="bg-gradient-to-br from-blockchain-blue to-blockchain-purple p-6 rounded-lg shadow-lg text-white"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.5 }}
                   >
                     <h3 className="text-2xl font-bold mb-2">BlockE UIDs Minted</h3>
                     <p className="text-4xl font-bold">
                       <AnimatedNumber value={blockeUIDMinted} />
                     </p>
                   </motion.div>
                 </div>
               )}
             </div>
           </ScrollSection>
         </div>

         <BlockEFooter />
       </>
     )}
   </main>
   <WalletModal />
   <SocialMediaLinks />
 </div>
)
}

