export const NETWORKS = ['Mainnet', 'Testnet'];

export const networkSettings = (
  network: string,
  setNetwork: (n: string) => void
) => {
  return {
    networks: NETWORKS,
    onNetworkSwitch: (n: string) => {
      setNetwork(n);
      // Optional: log for debugging
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log(`Switched network to ${n}.`);
      }
    },
    currentNetwork: network,
  };
};

