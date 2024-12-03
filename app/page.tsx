import Sidebar from '../components/Sidebar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      <main className="flex flex-col items-center justify-center p-24 text-center">
        <h2 className="text-5xl font-bold mb-6 text-gray-800">Welcome to BlockE</h2>
        <p className="text-xl mb-8 text-gray-600 max-w-2xl">
          Dive into the world of Web 3.0 with BlockE. Explore decentralized finance, NFTs, and blockchain analytics all in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <FeatureCard
            title="Decentralized Finance"
            description="Access the latest DeFi protocols and track your investments."
          />
          <FeatureCard
            title="NFT Analytics"
            description="Get insights on the hottest NFT collections and market trends."
          />
          <FeatureCard
            title="Blockchain Intelligence"
            description="Analyze on-chain data and predict market movements."
          />
          <FeatureCard
            title="Social Sentiment"
            description="Gauge market sentiment from social media and news sources."
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

