declare global {
  interface Window {
    csprclick: {
      signIn: () => void;
      signOut: () => void;
      getActiveAccount: () => any;
      send: (
        deploy: any,
        sender: string,
        onStatus?: (status: string, data?: unknown) => void
      ) => Promise<unknown>;
      appSettings?: {
        csprlive_url?: string;
      };
    };
  }
}

export {};
