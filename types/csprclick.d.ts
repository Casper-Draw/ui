declare global {
  interface CsprClick {
    signIn: () => void;
    signOut: () => void;
    on: (event: string, cb: (evt: unknown) => void) => void;
  }

  interface Window {
    csprclick?: CsprClick;
  }
}

export {};
