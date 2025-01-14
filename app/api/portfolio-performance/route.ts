import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, retries = 3, backoff = 300): Promise<any> => { // Added return type annotation
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

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const provider = new ethers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
    )

    // Get historical ETH prices from CoinGecko with retry mechanism
    const priceData = await fetchWithRetry(
      'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily'
    );

    const prices = priceData.prices

    // Get historical balance using eth_getBalance for each block
    const portfolioData = await Promise.all(
      prices.map(async ([timestamp]: [number, number]) => {
        const blockNumber = await provider.getBlockNumber()
        const balance = await provider.getBalance(address, blockNumber)
        
        return {
          date: new Date(timestamp).toISOString().split('T')[0],
          value: parseFloat(ethers.formatEther(balance))
        }
      })
    )

    return NextResponse.json({ success: true, portfolioData })
  } catch (error) {
    console.error('Error fetching portfolio performance:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch portfolio performance' },
      { status: 500 }
    )
  }
}

