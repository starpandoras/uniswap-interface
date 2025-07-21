import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Token } from '@uniswap/sdk'
import { AppDispatch, AppState } from '../index'
import { BASE_SEPOLIA_CHAIN_ID } from '../../constants'
import { GraphQLToken, graphqlService } from '../../services/graphql'
import {
    fetchTokensStart,
    fetchTokensSuccess,
    fetchTokensError,
    searchTokensStart,
    searchTokensSuccess,
    searchTokensError,
    clearTokenSearch
} from './actions'

// Convert GraphQL token to Uniswap SDK Token
export function graphqlTokenToToken(graphqlToken: GraphQLToken, chainId: number = BASE_SEPOLIA_CHAIN_ID): Token {
    return new Token(
        chainId,
        graphqlToken.id, // address
        parseInt(graphqlToken.decimals),
        graphqlToken.symbol,
        graphqlToken.name
    )
}

// Token address map type for compatibility
export type TokenAddressMap = {
    readonly [chainId: number]: {
        [address: string]: Token
    }
}

// Hook to get all tokens state
export function useTokensState() {
    return useSelector<AppState, AppState['tokens']>(state => state.tokens)
}

// Hook to fetch all tokens
export function useFetchAllTokens() {
    const dispatch = useDispatch<AppDispatch>()

    return useCallback(async () => {
        try {
            dispatch(fetchTokensStart())
            const tokens = await graphqlService.getAllTokens()
            dispatch(fetchTokensSuccess({ tokens }))
        } catch (error) {
            dispatch(fetchTokensError({ error: error instanceof Error ? error.message : 'Failed to fetch tokens' }))
        }
    }, [dispatch])
}

// Hook to search tokens
export function useSearchTokens() {
    const dispatch = useDispatch<AppDispatch>()

    return useCallback(async (query: string) => {
        try {
            dispatch(searchTokensStart({ query }))
            const tokens = await graphqlService.searchTokens(query)
            dispatch(searchTokensSuccess({ query, tokens }))
        } catch (error) {
            dispatch(searchTokensError({
                query,
                error: error instanceof Error ? error.message : 'Failed to search tokens'
            }))
        }
    }, [dispatch])
}

// Hook to clear search
export function useClearTokenSearch() {
    const dispatch = useDispatch<AppDispatch>()

    return useCallback(() => {
        dispatch(clearTokenSearch())
    }, [dispatch])
}

// Hook to get all tokens as Token instances
export function useAllGraphQLTokens(chainId: number = BASE_SEPOLIA_CHAIN_ID): Token[] {
    const { allTokens } = useTokensState()

    return useMemo(() => {
        return allTokens.data.map((graphqlToken: GraphQLToken) => graphqlTokenToToken(graphqlToken, chainId))
    }, [allTokens.data, chainId])
}

// Hook to get search results as Token instances
export function useTokenSearchResults(chainId: number = BASE_SEPOLIA_CHAIN_ID): Token[] {
    const { searchResults } = useTokensState()

    return useMemo(() => {
        return searchResults.data.map((graphqlToken: GraphQLToken) => graphqlTokenToToken(graphqlToken, chainId))
    }, [searchResults.data, chainId])
}

// Hook to get all tokens in the compatible TokenAddressMap format
export function useAllTokensMap(chainId: number = BASE_SEPOLIA_CHAIN_ID): TokenAddressMap {
    const allTokens = useAllGraphQLTokens(chainId)

    return useMemo(() => {
        const tokenMap: { [chainId: number]: { [address: string]: Token } } = {
            [chainId]: {}
        }

        allTokens.forEach(token => {
            tokenMap[chainId][token.address] = token
        })

        return tokenMap as TokenAddressMap
    }, [allTokens, chainId])
}

// Auto-fetch all tokens on mount
export function useAutoFetchTokens() {
    const fetchAllTokens = useFetchAllTokens()
    const { allTokens } = useTokensState()

    useEffect(() => {
        // Only fetch if we don't have tokens and we're not already loading
        if (allTokens.data.length === 0 && !allTokens.loading) {
            fetchAllTokens()
        }
    }, [fetchAllTokens, allTokens.data.length, allTokens.loading])
} 