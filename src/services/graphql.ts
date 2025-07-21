interface GraphQLToken {
  id: string
  name: string
  symbol: string
  decimals: string
  curve: {
    id: string
    priceInCapital: string
    capital: {
      id: string
      symbol: string
      decimals: string
      __typename: string
    }
    tokenSupply: string
    __typename: string
  }
  totalSupply: string
  creation: {
    blockTimestamp: string
    creator: string
    blockNumber: string
    __typename: string
  }
  __typename: string
}

interface GraphQLResponse {
  data: {
    tokens: GraphQLToken[]
  }
}

const GRAPHQL_ENDPOINT = 'https://api.studio.thegraph.com/query/107271/ift-test-sepolia/v0.8.1'
const AUTHORIZATION_TOKEN = '88d984a69147e7229d9a3dcb02519db0'

const TOKEN_SEARCH_QUERY = `
  query TokenSearch($tokenName: String!) {
    tokens(first: 10, where: {name_contains_nocase: $tokenName}) {
      id
      name
      symbol
      decimals
      curve {
        id
        priceInCapital
        capital {
          id
          symbol
          decimals
          __typename
        }
        tokenSupply
        __typename
      }
      totalSupply
      creation {
        blockTimestamp
        creator
        blockNumber
        __typename
      }
      __typename
    }
  }
`

const ALL_TOKENS_QUERY = `
  query AllTokens {
    tokens(first: 100) {
      id
      name
      symbol
      decimals
      curve {
        id
        priceInCapital
        capital {
          id
          symbol
          decimals
          __typename
        }
        tokenSupply
        __typename
      }
      totalSupply
      creation {
        blockTimestamp
        creator
        blockNumber
        __typename
      }
      __typename
    }
  }
`

class GraphQLService {
  private async request<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTHORIZATION_TOKEN}`,
          'Accept': '*/*',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          query,
          variables: variables || {}
        })
      })

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`)
      }

      return data
    } catch (error) {
      console.error('GraphQL request error:', error)
      throw error
    }
  }

  async searchTokens(tokenName: string = ''): Promise<GraphQLToken[]> {
    try {
      const response: GraphQLResponse = await this.request(TOKEN_SEARCH_QUERY, { tokenName })
      return response.data.tokens || []
    } catch (error) {
      console.error('Error searching tokens:', error)
      return []
    }
  }

  async getAllTokens(): Promise<GraphQLToken[]> {
    try {
      const response: GraphQLResponse = await this.request(ALL_TOKENS_QUERY)
      return response.data.tokens || []
    } catch (error) {
      console.error('Error fetching all tokens:', error)
      return []
    }
  }
}

export const graphqlService = new GraphQLService()
export type { GraphQLToken } 