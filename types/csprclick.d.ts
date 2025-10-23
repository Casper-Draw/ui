declare global {
  interface CsprClick {
    signIn: () => void;
    signOut: () => void;
    connect: (withProvider: string, options?: unknown) => Promise<unknown>;
    on: (event: string, cb: (evt: unknown) => void) => void;
    showByCsprUi?: () => void;
  }

  interface Window {
    csprclick?: CsprClick;
  }
}

export {};
