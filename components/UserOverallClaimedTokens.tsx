import Image from 'next/image'

interface UserOverallClaimedTokensProps {
  amount: string
}

export default function UserOverallClaimedTokens({ amount }: UserOverallClaimedTokensProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[#4F46E5] shadow-lg">
      <div className="flex items-center gap-2">
        <Image
          src="/blocke-logo.png"
          alt="BE Token"
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="text-lg font-semibold">Your Overall Claimed BE:</span>
      </div>
      <p className="text-2xl font-bold text-green-600 mt-2">{parseFloat(amount).toFixed(2)} BE</p>
    </div>
  )
}

