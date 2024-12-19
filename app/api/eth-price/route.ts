import { NextResponse } from 'next/server'

const FALLBACK_ETH_PRICE = 2000 // A reasonable fallback price

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY
  const coingeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd${apiKey ? `&x_cg_demo_api_key=${apiKey}` : ''}`

  try {
    const response = await fetch(coingeckoUrl, { next: { revalidate: 60 } }) // Cache for 60 seconds

    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status ${response.status}`)
    }

    const data = await response.json()
    const ethPrice = data.ethereum?.usd

    if (!ethPrice) {
      throw new Error('ETH price not found in the API response')
    }

    return NextResponse.json({ price: ethPrice })
  } catch (error) {
    console.error('Error fetching ETH price:', error)
    // Return a fallback price with an error flag
    return NextResponse.json({ price: FALLBACK_ETH_PRICE, error: 'Failed to fetch real-time ETH price, using fallback value', isFallback: true })
  }
}

