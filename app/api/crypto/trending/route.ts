import { NextResponse } from 'next/server'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export async function GET() {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/search/trending`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko API')
    }

    const data = await response.json()
    const trendingCoins = data.coins.slice(0, 7).map((coin: any) => ({
      name: coin.item.name,
      symbol: coin.item.symbol,
      marketCapRank: coin.item.market_cap_rank,
      priceBtc: coin.item.price_btc.toFixed(8),
      score: coin.item.score + 1
    }))

    return NextResponse.json({
      success: true,
      trendingCoins
    })
  } catch (error) {
    console.error('Error fetching trending coins:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch trending coins' 
    }, { status: 500 })
  }
}

