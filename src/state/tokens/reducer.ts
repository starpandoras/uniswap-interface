import { createReducer } from '@reduxjs/toolkit'
import { GraphQLToken } from '../../services/graphql'
import {
    fetchTokensStart,
    fetchTokensSuccess,
    fetchTokensError,
    searchTokensStart,
    searchTokensSuccess,
    searchTokensError,
    clearTokenSearch
} from './actions'

export interface TokensState {
    // All tokens from GraphQL
    allTokens: {
        data: GraphQLToken[]
        loading: boolean
        error: string | null
    }
    // Search results
    searchResults: {
        query: string
        data: GraphQLToken[]
        loading: boolean
        error: string | null
    }
}

const initialState: TokensState = {
    allTokens: {
        data: [],
        loading: false,
        error: null
    },
    searchResults: {
        query: '',
        data: [],
        loading: false,
        error: null
    }
}

export default createReducer(initialState, builder =>
    builder
        // Fetch all tokens
        .addCase(fetchTokensStart, state => {
            state.allTokens.loading = true
            state.allTokens.error = null
        })
        .addCase(fetchTokensSuccess, (state, { payload: { tokens } }) => {
            state.allTokens.loading = false
            state.allTokens.data = tokens
            state.allTokens.error = null
        })
        .addCase(fetchTokensError, (state, { payload: { error } }) => {
            state.allTokens.loading = false
            state.allTokens.error = error
        })

        // Search tokens
        .addCase(searchTokensStart, (state, { payload: { query } }) => {
            state.searchResults.loading = true
            state.searchResults.error = null
            state.searchResults.query = query
        })
        .addCase(searchTokensSuccess, (state, { payload: { query, tokens } }) => {
            state.searchResults.loading = false
            state.searchResults.data = tokens
            state.searchResults.error = null
            state.searchResults.query = query
        })
        .addCase(searchTokensError, (state, { payload: { query, error } }) => {
            state.searchResults.loading = false
            state.searchResults.error = error
            state.searchResults.query = query
        })

        // Clear search
        .addCase(clearTokenSearch, state => {
            state.searchResults.query = ''
            state.searchResults.data = []
            state.searchResults.loading = false
            state.searchResults.error = null
        })
) 