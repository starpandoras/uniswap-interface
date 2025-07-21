import { ChainId, Currency, CurrencyAmount, ETHER, Token, TokenAmount } from '@uniswap/sdk'
import { WETH_EXTENDED } from '../constants'

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | number | undefined): Token | undefined {
  return chainId && currency === ETHER ? WETH_EXTENDED[chainId] : currency instanceof Token ? currency : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | number | undefined
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function unwrappedToken(token: Token): Currency {
  if (token.equals(WETH_EXTENDED[token.chainId])) return ETHER
  return token
}
