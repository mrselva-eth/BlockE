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
    ? 'bg-[#6C5CE7] hover:bg-[#5849D1]'
    : 'bg-[#00B8A9] hover:bg-[#00A396]'

  const circleColors = variant === 'purple'
    ? ['bg-[#6C5CE7]', 'bg-[#8A7EEB]', 'bg-[#A59BEF]']
    : ['bg-[#00B8A9]', 'bg-[#33C7BB]', 'bg-[#66D6CD]']

  return (
    <div className={`relative overflow-hidden rounded-3xl ${bgColor} ${className}`}>
      {/* Decorative circles */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className={`absolute w-32 h-32 rounded-full ${circleColors[0]} opacity-20 -top-10 -right-10`}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: 360 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className={`absolute w-24 h-24 rounded-full ${circleColors[1]} opacity-20 bottom-20 -left-10`}
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: -360 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className={`absolute w-40 h-40 rounded-full ${circleColors[2]} opacity-10 -bottom-20 -right-20`}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: 180 
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-12">
        <div className="flex flex-col justify-center">
          <motion.h2 
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-gray-700 dark:text-gray-300"
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
              className={`inline-flex items-center px-8 py-4 ${buttonColor} text-white rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
            >
              {ctaText}
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </div>
        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={800}
            height={500}
            className="rounded-xl shadow-2xl"
          />
        </motion.div>
      </div>
    </div>
  )
}

