const POLYGONSCAN_API_KEY = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY

export async function getTransactionStatus(txHash: string) {
  try {
    const response = await fetch(
      `https://api.polygonscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${POLYGONSCAN_API_KEY}`
    )
    const data = await response.json()
    return data.result.status === '1' // '1' for success, '0' for failure
  } catch (error) {
    console.error('Error fetching transaction status:', error)
    return null
  }
}

export async function getTransactionDetails(txHash: string) {
  try {
    const response = await fetch(
      `https://api.polygonscan.com/api?module=transaction&action=gettxinfo&txhash=${txHash}&apikey=${POLYGONSCAN_API_KEY}`
    )
    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Error fetching transaction details:', error)
    return null
  }
}

