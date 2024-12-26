import { NextResponse } from 'next/server'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export async function GET() {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/global`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko API')
    }

    const data = await response.json()
    const marketData = data.data

    return NextResponse.json({
      success: true,
      totalMarketCap: marketData.total_market_cap.usd.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      totalVolume: marketData.total_volume.usd.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      btcDominance: marketData.market_cap_percentage.btc.toFixed(2),
      ethDominance: marketData.market_cap_percentage.eth.toFixed(2),
      marketCapChange24h: marketData.market_cap_change_percentage_24h_usd.toFixed(2)
    })
  } catch (error) {
    console.error('Error fetching market data:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch market data' 
    }, { status: 500 })
  }
}

