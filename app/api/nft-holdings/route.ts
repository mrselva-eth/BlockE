import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    // Fetch NFTs from OpenSea API
    const response = await fetch(
      `https://api.opensea.io/api/v2/chain/ethereum/account/${address}/nfts`,
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY || '',
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch NFTs from OpenSea: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid content type received from OpenSea API')
    }

    const data = await response.json()
    
    // Transform the data to match our NFT interface
    const nfts = await Promise.all(data.nfts.map(async (nft: any) => {
      // Get floor price from collection stats
      const statsResponse = await fetch(
        `https://api.opensea.io/api/v2/collections/${nft.collection}/stats`,
        {
          headers: {
            'X-API-KEY': process.env.OPENSEA_API_KEY || '',
            'Accept': 'application/json'
          }
        }
      )
      
      if (!statsResponse.ok) {
        console.error(`Failed to fetch stats for collection ${nft.collection}`)
        return null
      }

      const stats = await statsResponse.json()
      
      return {
        id: nft.identifier,
        name: nft.name || `${nft.collection} #${nft.identifier}`,
        description: nft.description || 'No description available',
        image: nft.image_url,
        estimatedValue: stats.floor_price?.toString() || '0'
      }
    }))

    const validNfts = nfts.filter(nft => nft !== null)

    return NextResponse.json({ success: true, nfts: validNfts })
  } catch (error) {
    console.error('Error fetching NFT holdings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NFT holdings. Please try again later.' },
      { status: 500 }
    )
  }
}

