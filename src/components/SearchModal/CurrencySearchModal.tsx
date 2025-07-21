import { Currency } from '@uniswap/sdk'
import React, { useCallback, useEffect, useState } from 'react'
import ReactGA from 'react-ga'
import useLast from '../../hooks/useLast'
import { useActiveWeb3React } from '../../hooks'
import { useSelectedListUrl } from '../../state/lists/hooks'
import { BASE_SEPOLIA_CHAIN_ID } from '../../constants'
import Modal from '../Modal'
import { CurrencySearch } from './CurrencySearch'
import ListIntroduction from './ListIntroduction'
import { ListSelect } from './ListSelect'

interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false
}: CurrencySearchModalProps) {
  const { chainId } = useActiveWeb3React()
  const [listView, setListView] = useState<boolean>(false)
  const lastOpen = useLast(isOpen)

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setListView(false)
    }
  }, [isOpen, lastOpen])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  const handleClickChangeList = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Change Lists'
    })
    setListView(true)
  }, [])

  const handleClickBack = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Back'
    })
    setListView(false)
  }, [])

  const handleSelectListIntroduction = useCallback(() => {
    setListView(true)
  }, [])

  const selectedListUrl = useSelectedListUrl()
  const noListSelected = !selectedListUrl

  // For Base Sepolia, always show CurrencySearch directly since we use GraphQL
  const isBaseSepolia = chainId === BASE_SEPOLIA_CHAIN_ID
  const shouldShowCurrencySearch = isBaseSepolia || (!listView && !noListSelected)
  const shouldShowListIntroduction = !isBaseSepolia && !listView && noListSelected

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      maxHeight={90}
      minHeight={listView ? 40 : shouldShowListIntroduction ? 0 : 80}
    >
      {listView ? (
        <ListSelect onDismiss={onDismiss} onBack={handleClickBack} />
      ) : shouldShowListIntroduction ? (
        <ListIntroduction onSelectList={handleSelectListIntroduction} />
      ) : shouldShowCurrencySearch ? (
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={handleCurrencySelect}
          onChangeList={handleClickChangeList}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
        />
      ) : null}
    </Modal>
  )
}
