import { NextResponse } from 'next/server'

const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1'

export async function GET() {
  try {
    const response = await fetch(
      `${CMC_API_URL}/cryptocurrency/listings/latest?limit=10`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY!,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from CoinMarketCap API')
    }

    const data = await response.json()
    
    const cryptocurrencies = data.data.map((crypto: any) => ({
      name: crypto.name,
      symbol: crypto.symbol,
      price: crypto.quote.USD.price.toFixed(2),
      marketCap: crypto.quote.USD.market_cap.toFixed(2),
      change24h: crypto.quote.USD.percent_change_24h.toFixed(2)
    }))

    return NextResponse.json({
      success: true,
      cryptocurrencies
    })
  } catch (error) {
    console.error('Error fetching top cryptocurrencies:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch top cryptocurrencies' 
    }, { status: 500 })
  }
}

