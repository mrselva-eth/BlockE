'use client'

import { useState, useEffect, useCallback } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import Loader from '../Loader'

interface ActivityData {
  date: string
  count: number
}

interface ActivityHeatmapProps {
  address: string
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ address }) => {
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const fetchActivityData = useCallback(async () => {
    if (!address) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      const response = await fetch(`/api/activity-heatmap?address=${address}&year=${year}&month=${month}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activity data')
      }

      if (!data.success) {
        throw new Error(data.error || 'Invalid response from server')
      }

      if (data.message === 'No data available for future dates') {
        setActivityData([])
        setError('No data available for future dates')
      } else {
        setActivityData(data.activityData || [])
      }
    } catch (err) {
      console.error('Error fetching activity data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch activity data')
      setActivityData([])
    } finally {
      setIsLoading(false)
    }
  }, [address, currentDate])

  useEffect(() => {
    fetchActivityData()
  }, [fetchActivityData])

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    const now = new Date()
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() + 1)
      return newDate > now ? prevDate : newDate
    })
  }

  // Function to get week number
  const getWeekNumber = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    return Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7)
  }

  // Generate all days of the month
  const generateMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1)
      return {
        date: date.toISOString().split('T')[0],
        count: activityData.find(d => d.date === date.toISOString().split('T')[0])?.count || 0,
        weekNumber: getWeekNumber(date)
      }
    })
  }

  if (!address) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-lg">
        <div className="text-center text-gray-600">
          Please enter an address to view activity data.
        </div>
      </div>
    )
  }

  const monthDays = generateMonthDays()
  const weeks = Math.ceil(monthDays.length / 7)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Activity Heatmap
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full bg-white/80 backdrop-blur-sm text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-white/80 transition-all duration-200"
            disabled={isLoading}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-medium bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full bg-white/80 backdrop-blur-sm text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-white/80 transition-all duration-200"
            disabled={
              isLoading ||
              (currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear())
            }
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[7/4]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader size={24} className="text-purple-500" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-red-500 mb-2" />
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={fetchActivityData}
                className="mt-2 px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full pl-8">
            <div className="grid grid-cols-7 gap-0.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-xs text-gray-500 font-medium text-center">
                  {day.charAt(0)}
                </div>
              ))}
              {monthDays.map((day, index) => (
                <div
                  key={day.date}
                  className={`aspect-square relative scale-95 ${
                    index % 7 === 0 ? 'relative' : ''
                  }`}
                >
                  {index % 7 === 0 && (
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                      Week {day.weekNumber}
                    </div>
                  )}
                  <div
                    className={`w-full h-full rounded-sm border border-gray-200 ${
                      day.count === 0
                        ? 'bg-gray-50'
                        : day.count <= 2
                        ? 'bg-purple-100'
                        : day.count <= 4
                        ? 'bg-purple-300'
                        : day.count <= 6
                        ? 'bg-purple-500'
                        : 'bg-purple-700'
                    }`}
                    title={`${day.date}: ${day.count} transaction${
                      day.count !== 1 ? 's' : ''
                    }`}
                  >
                    <div className="text-[10px] text-center text-gray-600 mt-1">
                      {new Date(day.date).getDate()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {monthDays.length === 0 && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
                <p className="text-sm text-gray-600 font-medium">
                  No activity data available for this period.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end items-center gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="text-gray-500">Activity:</div>
          <div className="flex items-center gap-2">
            {[
              { label: '0', class: 'bg-gray-50' },
              { label: '1-2', class: 'bg-purple-100' },
              { label: '3-4', class: 'bg-purple-300' },
              { label: '5-6', class: 'bg-purple-500' },
              { label: '7+', class: 'bg-purple-700' },
            ].map((level) => (
              <div key={level.label} className="flex items-center gap-1">
                <div
                  className={`w-3 h-3 ${level.class} border border-gray-200 rounded-sm`}
                />
                <span className="text-gray-500">{level.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityHeatmap

