declare global {
  interface Window {
    csprclick: {
      signIn: () => void;
      signOut: () => void;
      getActiveAccount: () => any;
      send: (deploy: any, sender: string) => Promise<string>;
      appSettings?: {
        csprlive_url?: string;
      };
    };
  }
}

export {};
