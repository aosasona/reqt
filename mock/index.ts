type AuthStoreState = {
  isSignedIn: boolean;
  signOut: () => void;
};

interface AuthStore {
  getState: () => AuthStoreState;
}

// replace this with your own auth store (modelled after zustand)
export const mockAuthStore: AuthStore = {
  getState: () => ({
    isSignedIn: false,
    signOut: () => { },
  }),
};

interface Toast {
  error: (message: string) => void;
}

// replace this with your own toast library
export const mockToast: Toast = {
  error: (_: string) => { },
};
