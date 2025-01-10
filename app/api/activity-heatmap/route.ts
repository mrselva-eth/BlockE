import { NextResponse } from 'next/server'

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, retries = 3, backoff = 300) => {
  try {
    const response = await fetch(url);
    if (response.status === 429 && retries > 0) {
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  console.log(`Fetching activity data for address: ${address}, month: ${month}, year: ${year}`)

  if (!address || !month || !year) {
    return NextResponse.json({ error: 'Address, month, and year are required' }, { status: 400 })
  }

  const currentDate = new Date();
  const requestDate = new Date(parseInt(year), parseInt(month) - 1);

  if (requestDate > currentDate) {
    return NextResponse.json({ 
      success: true, 
      activityData: [],
      message: 'No data available for future dates'
    })
  }

  try {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0)

    const startTimestamp = Math.floor(startDate.getTime() / 1000)
    const endTimestamp = Math.floor(endDate.getTime() / 1000)

    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}&startdate=${startTimestamp}&enddate=${endTimestamp}`

    const data = await fetchWithRetry(url);

    if (data.status !== '1') {
      throw new Error(data.message || 'Failed to fetch transaction data from Etherscan')
    }

    const activityData = processTransactions(data.result, parseInt(year), parseInt(month))

    console.log(`Processed activity data:`, activityData)

    return NextResponse.json({ success: true, activityData })
  } catch (error) {
    console.error('Error in activity-heatmap API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity data. Please try again later.' },
      { status: 500 }
    )
  }
}

function processTransactions(transactions: any[], year: number, month: number): { date: string; count: number }[] {
  console.log(`Processing ${transactions.length} transactions for ${year}-${month}`)

  const activityMap = new Map<string, number>()

  transactions.forEach((tx: any) => {
    const date = new Date(parseInt(tx.timeStamp) * 1000)
    if (date.getFullYear() === year && date.getMonth() === month - 1) {
      const dateString = date.toISOString().split('T')[0]
      activityMap.set(dateString, (activityMap.get(dateString) || 0) + 1)
      console.log(`Transaction on ${dateString}: Count ${activityMap.get(dateString)}`)
    }
  })

  const activityData: { date: string; count: number }[] = []
  for (let [date, count] of activityMap) {
    activityData.push({ date, count })
  }

  console.log(`Final activity data:`, activityData)

  return activityData
}

