import React from 'react'
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import { Text } from 'rebass'


const BASE_SEPOLIA_CHAIN_ID = 84532
/**
 * Debug component to test Base Sepolia network support
 * Can be temporarily added to App.tsx for testing
 */
export default function NetworkDebugger() {
    const { active, account, chainId, error, connector } = useWeb3React()

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: '#f0f0f0',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '300px',
            zIndex: 1000
        }}>
            <Text fontSize={14} fontWeight={600} marginBottom="5px">
                🔍 Network Debug Info
            </Text>

            <div>
                <strong>Active:</strong> {active ? 'Yes' : 'No'}
            </div>

            <div>
                <strong>Account:</strong> {account ? account.slice(0, 8) + '...' : 'None'}
            </div>

            <div>
                <strong>Chain ID:</strong> {chainId || 'None'}
            </div>

            <div>
                <strong>Base Sepolia ID:</strong> {BASE_SEPOLIA_CHAIN_ID}
            </div>

            <div>
                <strong>Is Base Sepolia:</strong> {chainId === BASE_SEPOLIA_CHAIN_ID ? 'Yes' : 'No'}
            </div>

            <div>
                <strong>Connector:</strong> {connector?.constructor.name || 'None'}
            </div>

            {error && (
                <div style={{ color: 'red', marginTop: '5px' }}>
                    <strong>Error:</strong> {error.name}
                    <br />
                    <strong>UnsupportedChainId:</strong> {error instanceof UnsupportedChainIdError ? 'Yes' : 'No'}
                    <br />
                    <strong>Message:</strong> {error.message}
                </div>
            )}

            {chainId && (
                <div style={{ marginTop: '5px', fontSize: '11px' }}>
                    <strong>Chain Info:</strong>
                    <br />
                    • Hex: {chainId.toString(16)}
                    <br />
                    • Expected Base Sepolia: 0x{BASE_SEPOLIA_CHAIN_ID.toString(16)}
                </div>
            )}
        </div>
    )
} 