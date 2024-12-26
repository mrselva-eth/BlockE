import { NextResponse } from 'next/server'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export async function GET() {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/exchanges?order=volume_desc&per_page=10`
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`, errorBody)
      throw new Error(`Failed to fetch from CoinGecko API: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    const exchanges = data.map((exchange: any) => ({
      name: exchange.name,
      volume24h: exchange.trade_volume_24h_btc.toFixed(2),
      trustScore: exchange.trust_score,
      yearEstablished: exchange.year_established || 'N/A'
    }))

    return NextResponse.json({
      success: true,
      exchanges
    })
  } catch (error) {
    console.error('Error fetching exchanges:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch exchanges'
    }, { status: 500 })
  }
}

