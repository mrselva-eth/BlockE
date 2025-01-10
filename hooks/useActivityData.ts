import { useState, useEffect } from 'react'

interface ActivityData {
  date: string
  count: number
}

export function useActivityData(address: string, year: number) {
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/activity-heatmap?address=${address}&year=${year}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (!data.activityData || !Array.isArray(data.activityData)) {
          throw new Error('Invalid data format received from the server')
        }
        setActivityData(data.activityData)
      } catch (err) {
        console.error('Error fetching activity data:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [address, year])

  return { activityData, isLoading, error }
}

