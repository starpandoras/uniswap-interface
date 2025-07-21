import { createAction } from '@reduxjs/toolkit'
import { GraphQLToken } from '../../services/graphql'

export const fetchTokensStart = createAction('tokens/fetchTokensStart')
export const fetchTokensSuccess = createAction<{ tokens: GraphQLToken[] }>('tokens/fetchTokensSuccess')
export const fetchTokensError = createAction<{ error: string }>('tokens/fetchTokensError')

export const searchTokensStart = createAction<{ query: string }>('tokens/searchTokensStart')
export const searchTokensSuccess = createAction<{ query: string; tokens: GraphQLToken[] }>('tokens/searchTokensSuccess')
export const searchTokensError = createAction<{ query: string; error: string }>('tokens/searchTokensError')

export const clearTokenSearch = createAction('tokens/clearTokenSearch') 