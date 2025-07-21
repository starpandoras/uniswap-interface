import { useEffect } from 'react'
import { useAutoFetchTokens } from './hooks'

export default function TokensUpdater(): null {
    // This hook automatically fetches tokens on mount
    useAutoFetchTokens()

    // Optional: Auto-refresh tokens periodically (every 5 minutes)
    useEffect(() => {
        const interval = setInterval(() => {
            // The auto-fetch hook will handle the logic to avoid duplicate fetches
            // You could add more sophisticated refresh logic here if needed
        }, 5 * 60 * 1000) // 5 minutes

        return () => clearInterval(interval)
    }, [])

    return null
} 