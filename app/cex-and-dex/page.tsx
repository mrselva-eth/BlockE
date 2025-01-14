'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import SocialMediaLinks from '@/components/SocialMediaLinks'
import { Github, Twitter, TextIcon as Telegram, Globe } from 'lucide-react'

interface Exchange {
 name: string
 logo: string
 description: string
 website: string
 twitter?: string
 github?: string
 telegram?: string
 category: 'cex' | 'dex'
}

const exchanges: Exchange[] = [
 {
   name: 'Binance',
   logo: '/cex/binance.png',
   description: 'Binance is a cryptocurrency exchange that provides a platform for trading various cryptocurrencies.',
   website: 'https://www.binance.com/',
   twitter: 'https://twitter.com/binance',
   category: 'cex'
 },
 {
   name: 'Coinbase',
   logo: '/cex/coinbase.png',
   description: 'Coinbase is a secure online platform for buying, selling, transferring, and storing digital currency.',
   website: 'https://www.coinbase.com/',
   twitter: 'https://twitter.com/coinbase',
   category: 'cex'
 },
 {
   name: 'Kraken',
   logo: '/cex/kraken.png',
   description: 'Kraken is a US-based cryptocurrency exchange founded in 2011 that offers trading between cryptocurrencies and fiat currencies.',
   website: 'https://www.kraken.com/',
   twitter: 'https://twitter.com/krakenfx',
   category: 'cex'
 },
 {
   name: 'KuCoin',
   logo: '/cex/kucoin.png',
   description: 'KuCoin is a global cryptocurrency exchange that offers spot trading, margin trading, futures trading, staking, lending, and more.',
   website: 'https://www.kucoin.com/',
   twitter: 'https://twitter.com/kucoincom',
   category: 'cex'
 },
 {
   name: 'Huobi',
   logo: '/cex/huobi.png',
   description: 'Huobi is one of the world&apos;s leading digital asset exchanges, serving millions of users worldwide.',
   website: 'https://www.huobi.com/',
   twitter: 'https://twitter.com/HuobiGlobal',
   category: 'cex'
 },
 {
   name: 'Uniswap',
   logo: '/dex/uniswap.png',
   description: 'Uniswap is a decentralized exchange (DEX) that allows users to trade cryptocurrencies without intermediaries.',
   website: 'https://uniswap.org/',
   twitter: 'https://twitter.com/Uniswap',
   github: 'https://github.com/Uniswap',
   category: 'dex'
 },
 {
   name: 'SushiSwap',
   logo: '/dex/sushiswap.png',
   description: 'SushiSwap is a decentralized exchange (DEX) that offers a wide range of features, including swapping, staking, and yield farming.',
   website: 'https://www.sushi.com/',
   twitter: 'https://twitter.com/sushiswap',
   github: 'https://github.com/sushiswap',
   category: 'dex'
 },
 {
   name: 'PancakeSwap',
   logo: '/dex/pancakeswap.png',
   description: 'PancakeSwap is a decentralized exchange (DEX) built on the Binance Smart Chain (BSC).',
   website: 'https://pancakeswap.finance/',
   twitter: 'https://twitter.com/PancakeSwap',
   github: 'https://github.com/pancakeswap',
   telegram: 'https://t.me/PancakeSwap',
   category: 'dex'
 },
 {
   name: 'Curve',
   logo: '/dex/curve.png',
   description: 'Curve is a decentralized exchange (DEX) designed for efficient stablecoin trading.',
   website: 'https://curve.fi/',
   twitter: 'https://twitter.com/CurveFinance',
   github: 'https://github.com/curvefi',
   category: 'dex'
 },
 {
   name: 'Balancer',
   logo: '/dex/balancer.png',
   description: 'Balancer is a decentralized exchange (DEX) that allows users to create and manage their own custom liquidity pools.',
   website: 'https://balancer.fi/',
   twitter: 'https://twitter.com/Balancer',
   github: 'https://github.com/balancer-labs',
   category: 'dex'
 },
]

const PageSize = 5

export default function CexAndDexPage() {
 const [activeCategory, setActiveCategory] = useState<'cex' | 'dex'>('cex')
 const [currentPage, setCurrentPage] = useState(1)

 const filteredExchanges = useMemo(() => { // The fix: move the filter logic inside useMemo
   return exchanges.filter(exchange => exchange.category === activeCategory)
 }, [activeCategory]); // Only depend on activeCategory

 const currentTableData = useMemo(() => {
   const firstPageIndex = (currentPage - 1) * PageSize
   const lastPageIndex = firstPageIndex + PageSize
   return filteredExchanges.slice(firstPageIndex, lastPageIndex)
 }, [currentPage, filteredExchanges])

 const handlePageChange = (newPage: number) => {
   setCurrentPage(newPage)
 }

 return (
   <div className="min-h-screen relative">
     <Image
       src="/cexdex.png"
       alt="Cex and Dex Background"
       fill
       className="object-cover opacity-70"
       priority
     />
     <div className="relative z-10 flex">
       <Sidebar />
       <div className="flex-1 p-8">
         <div className="max-w-7xl mx-auto">
           <div className="flex justify-center space-x-4 mb-8">
             <button
               onClick={() => setActiveCategory('cex')}
               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                 activeCategory === 'cex'
                   ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
               }`}
             >
               Centralized Exchanges (Cex)
             </button>
             <button
               onClick={() => setActiveCategory('dex')}
               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                 activeCategory === 'dex'
                   ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
               }`}
             >
               Decentralized Exchanges (Dex)
             </button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
             {currentTableData.map((exchange: Exchange) => (
               <div key={exchange.name} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-200 transform hover:scale-[1.02] transition-transform duration-300">
                 <div className="flex items-center justify-between mb-4">
                   <Image src={exchange.logo} alt={`${exchange.name} Logo`} width={40} height={40} />
                   <div className="flex space-x-2">
                     {exchange.twitter && (
                       <Link href={exchange.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                         <Twitter size={20} />
                       </Link>
                     )}
                     {exchange.github && (
                       <Link href={exchange.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100">
                         <Github size={20} />
                       </Link>
                     )}
                     {exchange.telegram && (
                       <Link href={exchange.telegram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                         <Telegram size={20} />
                       </Link>
                     )}
                     <Link href={exchange.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                       <Globe size={20} />
                     </Link>
                   </div>
                 </div>
                 <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">{exchange.name}</h3>
                 <p className="text-gray-600 dark:text-gray-300">{exchange.description}</p>
               </div>
             ))}
           </div>
           {/* Pagination */}
           <div className="mt-8 flex justify-center">
             {Array.from({ length: Math.ceil(filteredExchanges.length / PageSize) }).map((_, i) => (
               <button
                 key={i + 1}
                 onClick={() => handlePageChange(i + 1)}
                 className={`px-4 py-2 mx-1 rounded-lg transition-colors ${
                   currentPage === i + 1
                     ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                 }`}
               >
                 {i + 1}
               </button>
             ))}
           </div>
         </div>
       </div>
       <SocialMediaLinks />
     </div>
   </div>
 )
}

