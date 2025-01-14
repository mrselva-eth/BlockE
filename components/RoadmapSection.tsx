'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { useTheme } from 'next-themes'

const roadmapItems = [
{
 year: 'Aug 2024',
 title: 'Project Start',
 description: 'BlockE project initiated'
},
{
 year: 'Sep 2024',
 title: 'Core Development',
 description: 'Development of core platform features'
},
{
 year: 'Oct 2024',
 title: 'Smart Contract Deployment',
 description: 'Deployment of smart contracts for BE Token and BlockE UID'
},
{
 year: 'Nov 2024',
 title: 'Frontend Development',
 description: 'Building user interfaces and integrating Web3 functionalities'
},
{
 year: 'Dec 2024',
 title: 'Backend Development',
 description: 'Setting up API routes and database integration'
},
{
 year: 'Jan 2025',
 title: 'Testing and Refinement',
 description: 'Thorough testing and refinement of platform features'
},
{
 year: 'Feb 2025',
 title: 'Platform Launch',
 description: 'Public launch of the BlockE platform'
}
]

export default function RoadmapSection() {
const { theme } = useTheme()

return (
 <div className="relative py-20 overflow-hidden">
   <div className="relative z-10 container mx-auto px-8">
     <h2 className={`text-4xl font-bold text-center mb-16 ${theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-blockchain-blue to-blockchain-purple bg-clip-text text-transparent'}`}>
       Our Roadmap
     </h2>
     <div className="relative">
       <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blockchain-blue to-blockchain-purple dark:bg-gradient-to-b dark:from-purple-800 dark:to-pink-800" />
       {roadmapItems.map((item, index) => (
         <motion.div
           key={item.year}
           className="relative mb-16 last:mb-0"
           initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true, amount: 0.5 }}
           transition={{ duration: 0.5, delay: index * 0.2 }}
         >
           <div className={`flex items-center ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
             <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
               <div className="bg-white/80 dark:bg-gray-900/80 p-6 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 backdrop-blur-sm">
                 <div className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-blockchain-blue'}`}>{item.year}</div>
                 <h3 className={`text-xl font-bold mb-2 text-gray-900 dark:text-white`}>{item.title}</h3> {/* Updated */}
                 <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
               </div>
             </div>
             <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-white/80 dark:bg-gray-900/80 rounded-full border-4 border-blockchain-purple dark:border-pink-600 flex items-center justify-center backdrop-blur-sm">
               <CheckCircle className={`${theme === 'dark' ? 'text-white' : 'text-blockchain-blue'}`} size={16} />
             </div>
           </div>
         </motion.div>
       ))}
     </div>
   </div>
 </div>
)
}

