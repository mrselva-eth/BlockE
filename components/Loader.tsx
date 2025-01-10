import { Loader2 } from 'lucide-react'

interface LoaderProps {
  size?: number
  className?: string
}

export default function Loader({ size = 24, className = '' }: LoaderProps) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />
}

