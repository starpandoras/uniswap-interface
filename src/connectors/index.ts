import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'

import { FortmaticConnector } from './Fortmatic'
import { NetworkConnector } from './NetworkConnector'

const BASE_SEPOLIA_CHAIN_ID = 84532
const NETWORK_URL = process.env.REACT_APP_NETWORK_URL || 'https://sepolia.base.org'
const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID

// Default to Base Sepolia instead of mainnet
export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? BASE_SEPOLIA_CHAIN_ID.toString())

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL }
})

// All supported chain IDs for wallet connections
const SUPPORTED_CHAIN_IDS = [7777777, BASE_SEPOLIA_CHAIN_ID]

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS
})

export const walletconnect = new WalletConnectConnector({
  rpc: { [NETWORK_CHAIN_ID]: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 12000
})

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Uniswap'
})

export const fortmatic = FORMATIC_KEY
  ? new FortmaticConnector({
    apiKey: FORMATIC_KEY as string,
    chainId: 7777777 // Fortmatic only supports limited chains
  })
  : undefined

export const portis = PORTIS_ID
  ? new PortisConnector({
    dAppId: PORTIS_ID as string,
    networks: [NETWORK_CHAIN_ID]
  })
  : undefined

export function getNetworkLibrary(): Web3Provider {
  return new Web3Provider(network.provider as any)
}
