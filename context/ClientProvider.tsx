'use client';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { CsprClickThemes, ThemeModeType } from '@make-software/csprclick-ui';
import { NETWORKS, networkSettings } from '@/components/settings/network';
import { CONTENT_MODE } from '@make-software/csprclick-core-types';

const ClickUI = dynamic(
  () => import('@make-software/csprclick-ui').then((mod) => mod.ClickUI),
  { ssr: false }
);

const ClickProvider = dynamic(
  () => import('@make-software/csprclick-ui').then((mod) => mod.ClickProvider),
  { ssr: false }
);


const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
});

const APP_ID = process.env.NEXT_PUBLIC_CSPRCLICK_APP_ID || 'cdd05c21fe0c4511b831cdb4db352e5f';
const DIGEST = process.env.NEXT_PUBLIC_CSPRCLICK_DIGEST || undefined;

const clickOptions: any = {
  appName: 'Casper Draw',
  appId: APP_ID,
  contentMode: CONTENT_MODE.IFRAME,
  providers: [
    'casper-wallet',
    'ledger',
    'casperdash',
    'metamask-snap',
    'torus-wallet',
    'casper-signer'
  ],
  // Ensure Testnet defaults are provided to the SDK
  chainName: 'casper-test',
  casperNode: 'https://rpc.testnet.casperlabs.io/rpc',
  // Optional: if your application requires a digest/api key
  ...(DIGEST ? { digestAuth: DIGEST } : {})
};

export default function ClientProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<string>(NETWORKS[1]); // Default to Testnet
  return (
    <ClickProvider options={clickOptions}>
      <ThemeProvider theme={CsprClickThemes.dark}>
        <QueryClientProvider client={queryClient}>
          {/* Hidden ClickUI to initialize the SDK without showing the top bar */}
          <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }}>
            <ClickUI
              topBarSettings={{
                networkSettings: networkSettings(network, setNetwork),
              }}
              themeMode={ThemeModeType.dark}
            />
          </div>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </ClickProvider>
  );
}
