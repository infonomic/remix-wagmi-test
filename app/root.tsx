import { useState } from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction } from '@remix-run/node'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'

import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, goerli, sepolia, hardhat } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
// import { LedgerConnector } from 'wagmi/connectors/ledger'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export default function App() {
  // Wagmi
  // Remix modules cannot have side effects so the initialization of `wagmi`
  // client happens during render, but the result is cached via `useState`
  // and a lazy initialization function.
  // See: https://remix.run/docs/en/v1/guides/constraints#no-module-side-effects
  const [{ config, chains }] = useState(() => {
    const testChains = [hardhat, goerli, sepolia]
    const { chains, publicClient, webSocketPublicClient } = configureChains(
      [mainnet, polygon, optimism, arbitrum, ...testChains],
      [publicProvider()]
    )
    const config = createConfig({
      autoConnect: true,
      connectors: [
        new MetaMaskConnector({ chains }),
        new CoinbaseWalletConnector({
          chains,
          options: {
            appName: 'wagmi-test',
          },
        }),
        // new WalletConnectConnector({
        //   chains,
        //   options: {
        //     projectId: 'your-project-id',
        //   },
        // }),
        new InjectedConnector({
          chains,
          options: {
            name: 'Injected',
            shimDisconnect: true,
          },
        }),
        // new LedgerConnector({
        //   chains,
        // }),
      ],
      publicClient,
      webSocketPublicClient,
    })
    return {
      config,
      chains,
    }
  })

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {config != null && chains != null ? (
          <WagmiConfig config={config}>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </WagmiConfig>
        ) : (
          <>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </>
        )}
      </body>
    </html>
  )
}
