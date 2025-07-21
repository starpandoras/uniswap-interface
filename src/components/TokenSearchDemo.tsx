import React, { useState } from 'react'
import { Text } from 'rebass'
import { useSearchTokens, useTokenSearchResults, useTokensState } from '../state/tokens/hooks'
import { BASE_SEPOLIA_CHAIN_ID } from '../constants'
import { ButtonPrimary } from './Button'
import { AutoColumn } from './Column'
import { RowBetween } from './Row'

/**
 * Demo component to test GraphQL token functionality
 * This can be temporarily added to pages/App.tsx to test the integration
 */
export default function TokenSearchDemo() {
    const [searchQuery, setSearchQuery] = useState('')
    const searchTokens = useSearchTokens()
    const searchResults = useTokenSearchResults(BASE_SEPOLIA_CHAIN_ID)
    const tokensState = useTokensState()

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            await searchTokens(searchQuery)
        }
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '8px' }}>
            <Text fontSize={18} fontWeight={600} marginBottom="10px">
                GraphQL Token Search Demo
            </Text>

            <AutoColumn gap="10px">
                <RowBetween>
                    <input
                        type="text"
                        placeholder="Search tokens (e.g., 'fox', 'giraffe')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: '8px', width: '200px', marginRight: '10px' }}
                    />
                    <ButtonPrimary onClick={handleSearch} disabled={tokensState.searchResults.loading}>
                        {tokensState.searchResults.loading ? 'Searching...' : 'Search'}
                    </ButtonPrimary>
                </RowBetween>

                {tokensState.searchResults.error && (
                    <Text color="red" fontSize={14}>
                        Error: {tokensState.searchResults.error}
                    </Text>
                )}

                <Text fontSize={14} fontWeight={500}>
                    Found {searchResults.length} tokens:
                </Text>

                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {searchResults.map((token, index) => (
                        <div
                            key={token.address}
                            style={{
                                padding: '8px',
                                border: '1px solid #eee',
                                marginBottom: '4px',
                                borderRadius: '4px'
                            }}
                        >
                            <Text fontSize={14}>
                                <strong>{token.symbol}</strong> - {token.name}
                            </Text>
                            <Text fontSize={12} color="gray">
                                Address: {token.address}
                            </Text>
                            <Text fontSize={12} color="gray">
                                Decimals: {token.decimals}
                            </Text>
                        </div>
                    ))}
                </div>

                <Text fontSize={12} color="gray">
                    Total tokens in state: {tokensState.allTokens.data.length}
                </Text>
            </AutoColumn>
        </div>
    )
} 