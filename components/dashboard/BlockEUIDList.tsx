import { useBlockEUID } from '@/hooks/useBlockEUID'
import { Loader } from 'lucide-react'

interface BlockEUIDListProps {
  address: string
}

export default function BlockEUIDList({ address }: BlockEUIDListProps) {
  const { ownedUIDs, isLoading, error } = useBlockEUID()

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-lg flex items-center justify-center h-24">
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
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-lg">
      <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Your BlockE UIDs</h2>
      {ownedUIDs.length > 0 ? (
        <ul className="space-y-1">
          {ownedUIDs.map((uid) => (
            <li key={uid.uid} className="text-purple-600">
              {uid.formattedUid}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No BlockE UIDs found</p>
      )}
    </div>
  )
}

