import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BlockE',
  description: 'Web 3.0 Analytics Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
          <div className="flex justify-between items-center h-full px-4 max-w-7xl mx-auto">
            <div className="flex items-center">
              <img src="/blocke-logo.svg" alt="BlockE Logo" className="h-8 w-8" />
              <h1 className="ml-2 text-2xl font-bold text-gray-800">BlockE</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                BlockE User ID
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                Connect Wallet
              </button>
            </div>
          </div>
        </nav>
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}

