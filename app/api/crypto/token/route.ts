import { NextResponse } from 'next/server'

const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const ticker = searchParams.get('ticker')

  if (!name || !ticker) {
    return NextResponse.json({ 
      success: false, 
      error: 'Name and ticker are required' 
    }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${CMC_API_URL}/cryptocurrency/quotes/latest?symbol=${ticker}`,
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
    const tokenData = data.data[ticker.toUpperCase()]

    if (!tokenData) {
      throw new Error('Token not found')
    }

    const quote = tokenData.quote.USD

    return NextResponse.json({
      success: true,
      name: tokenData.name,
      symbol: tokenData.symbol,
      price: quote.price.toFixed(2),
      marketCap: quote.market_cap.toFixed(2),
      volume24h: quote.volume_24h.toFixed(2),
      fdv: (tokenData.total_supply * quote.price).toFixed(2),
      volMktCap: (quote.volume_24h / quote.market_cap).toFixed(4),
      totalSupply: tokenData.total_supply.toLocaleString(),
      maxSupply: tokenData.max_supply?.toLocaleString(),
      circulatingSupply: tokenData.circulating_supply.toLocaleString()
    })
  } catch (error) {
    console.error('Error fetching token data:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch token data' 
    }, { status: 500 })
  }
}

