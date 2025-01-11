import { useBlockEUID } from '@/hooks/useBlockEUID'
import { Loader } from 'lucide-react'
import BEUIDCard from '@/components/blocke-uid/BEUIDCard';

interface BlockEUIDListProps {
  address: string
}

export default function BlockEUIDList({ address }: BlockEUIDListProps) {
  const { ownedUIDs, isLoading, error } = useBlockEUID()

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 shadow-lg flex items-center justify-center h-full">
        <Loader className="animate-spin text-purple-500" size={24} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-lg">
        <p className="text-red-500">Error loading BlockE UIDs</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 shadow-lg h-full overflow-y-auto">
      <h2 className="text-sm font-semibold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Your BlockE UIDs
      </h2>
      {ownedUIDs.length > 0 ? (
        <div className="space-y-2">
          {ownedUIDs.map((uid) => (
            <BEUIDCard
              key={uid.uid}
              uid={uid.uid}
              formattedUid={uid.formattedUid}
              digits={uid.digits}
              mintedAt={new Date()} // Provide a default date or fetch from the API
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-xs">No BlockE UIDs found</p>
      )}
    </div>
  )
}

