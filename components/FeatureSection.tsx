'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface FeatureSectionProps {
  title: string
  description: string
  ctaText: string
  ctaLink: string
  imageSrc: string
  imageAlt: string
  variant: 'purple' | 'teal'
  className?: string
}

export default function FeatureSection({
  title,
  description,
  ctaText,
  ctaLink,
  imageSrc,
  imageAlt,
  variant,
  className = ''
}: FeatureSectionProps) {
  const bgColor = variant === 'purple' 
    ? 'bg-[#F4F1FF] dark:bg-[#2D2B55]' 
    : 'bg-[#E6FFFD] dark:bg-[#1D4A47]'

  const buttonColor = variant === 'purple'
    ? 'from-[#6C5CE7] to-[#8A7EEB] hover:from-[#5849D1] hover:to-[#7A6EDB]'
    : 'from-[#00B8A9] to-[#33C7BB] hover:from-[#00A396] hover:to-[#2AB8AC]'

  const circleColors = variant === 'purple'
    ? ['bg-[#6C5CE7]', 'bg-[#8A7EEB]', 'bg-[#A59BEF]']
    : ['bg-[#00B8A9]', 'bg-[#33C7BB]', 'bg-[#66D6CD]']

  return (
    <div className={`relative overflow-hidden rounded-3xl ${bgColor} ${className} min-h-[600px] transform hover:scale-[1.02] transition-transform duration-300`}>
      {/* Decorative circles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className={`absolute w-64 h-64 rounded-full ${circleColors[0]} opacity-10 -top-20 -right-20`}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: 360 
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className={`absolute w-48 h-48 rounded-full ${circleColors[1]} opacity-10 bottom-40 -left-20`}
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: -360 
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className={`absolute w-80 h-80 rounded-full ${circleColors[2]} opacity-10 -bottom-40 -right-40`}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: 180 
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-16">
        <div className="flex flex-col justify-center">
          <motion.h2 
            className="text-6xl font-bold mb-8 leading-tight text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-2xl mb-10 text-gray-700 dark:text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              href={ctaLink}
              className={`inline-flex items-center px-10 py-5 bg-gradient-to-r ${buttonColor} text-white rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
            >
              {ctaText}
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </motion.div>
        </div>
        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={900}
              height={600}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

