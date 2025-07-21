import { Currency, ETHER, Token } from '@uniswap/sdk'
import React, { KeyboardEvent, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import ReactGA from 'react-ga'
import { useTranslation } from 'react-i18next'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useToken } from '../../hooks/Tokens'
import { useSearchTokens, useTokenSearchResults } from '../../state/tokens/hooks'
import { useSelectedListInfo } from '../../state/lists/hooks'
import { BASE_SEPOLIA_CHAIN_ID } from '../../constants'
import useDebounce from '../../hooks/useDebounce'
import { isAddress } from '../../utils'
import Column from '../Column'
import Row, { RowBetween } from '../Row'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { filterTokens } from './filtering'
import SortButton from './SortButton'
import { useTokenComparator } from './sorting'
import { PaddedColumn, SearchInput, Separator } from './styleds'
import AutoSizer from 'react-virtualized-auto-sizer'
import { CloseIcon, LinkStyledButton, TYPE } from '../../theme'
import Card from '../Card'
import ListLogo from '../ListLogo'
import QuestionHelper from '../QuestionHelper'

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  onChangeList: () => void
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  onChangeList
}: CurrencySearchProps) {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const fixedList = useRef<FixedSizeList>()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false)

  // Get tokens from both static lists and GraphQL
  const allTokens = useAllTokens()
  const searchTokens = useSearchTokens()
  const graphqlSearchResults = useTokenSearchResults(chainId || BASE_SEPOLIA_CHAIN_ID)

  // Debounce search query for GraphQL
  const debouncedQuery = useDebounce(searchQuery, 300)

  // Trigger GraphQL search for Base Sepolia when query changes
  useEffect(() => {
    if (chainId === BASE_SEPOLIA_CHAIN_ID && debouncedQuery.trim() !== '') {
      searchTokens(debouncedQuery)
    }
  }, [chainId, debouncedQuery, searchTokens])

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch
      })
    }
  }, [isAddressSearch])

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim()
    return s === '' || s === 'e' || s === 'et' || s === 'eth'
  }, [searchQuery])

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : []

    // For Base Sepolia, combine static tokens with GraphQL search results
    if (chainId === BASE_SEPOLIA_CHAIN_ID && searchQuery.trim() !== '') {
      const staticFiltered = filterTokens(Object.values(allTokens), searchQuery)
      // Combine and deduplicate
      const combined = [...staticFiltered]
      graphqlSearchResults.forEach(token => {
        if (!combined.find(t => t.address.toLowerCase() === token.address.toLowerCase())) {
          combined.push(token)
        }
      })
      return combined
    }

    return filterTokens(Object.values(allTokens), searchQuery)
  }, [isAddressSearch, searchToken, allTokens, searchQuery, chainId, graphqlSearchResults])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken]
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)
    if (symbolMatch.length > 1) return sorted

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0])
    ]
  }, [filteredTokens, searchQuery, searchToken, tokenComparator])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim()
        if (s === 'eth') {
          handleCurrencySelect(ETHER)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery]
  )

  const selectedListInfo = useSelectedListInfo()

  return (
    <Column style={{ width: '100%', flex: '1 1' }}>
      <PaddedColumn gap="14px">
        <RowBetween>
          <Text fontWeight={500} fontSize={16}>
            Select a token
            <QuestionHelper text="Find a token by searching for its name or symbol or by pasting its address below." />
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <SearchInput
          type="text"
          id="token-search-input"
          placeholder={t('tokenSearchPlaceholder')}
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
          onKeyDown={handleEnter}
        />
        {showCommonBases && (
          <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
        )}
        <RowBetween>
          <Text fontSize={14} fontWeight={500}>
            Token Name
          </Text>
          <SortButton ascending={invertSearchOrder} toggleSortOrder={() => setInvertSearchOrder(iso => !iso)} />
        </RowBetween>
      </PaddedColumn>

      <Separator />

      <div style={{ flex: '1' }}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <CurrencyList
              height={height}
              showETH={showETH}
              currencies={filteredSortedTokens}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
            />
          )}
        </AutoSizer>
      </div>

      <Separator />

      {/* Only show list selection for non-Base Sepolia chains */}
      {chainId !== BASE_SEPOLIA_CHAIN_ID && (
        <Card>
          <RowBetween>
            {selectedListInfo.current ? (
              <Row>
                {selectedListInfo.current.logoURI ? (
                  <ListLogo
                    style={{ marginRight: 12 }}
                    logoURI={selectedListInfo.current.logoURI}
                    alt={`${selectedListInfo.current.name} list logo`}
                  />
                ) : null}
                <TYPE.main id="currency-search-selected-list-name">{selectedListInfo.current.name}</TYPE.main>
              </Row>
            ) : null}
            <LinkStyledButton
              style={{ fontWeight: 500, color: theme.text2, fontSize: 16 }}
              onClick={onChangeList}
              id="currency-search-change-list-button"
            >
              {selectedListInfo.current ? 'Change' : 'Select a list'}
            </LinkStyledButton>
          </RowBetween>
        </Card>
      )}

      {/* For Base Sepolia, show GraphQL info instead */}
      {chainId === BASE_SEPOLIA_CHAIN_ID && (
        <Card>
          <RowBetween>
            <Row>
              <TYPE.main id="currency-search-graphql-info">
                Tokens loaded from The Graph
              </TYPE.main>
            </Row>
            <TYPE.body style={{ fontSize: 14, color: theme.text2 }}>
              Real-time token data
            </TYPE.body>
          </RowBetween>
        </Card>
      )}
    </Column>
  )
}
