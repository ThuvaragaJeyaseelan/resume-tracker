import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { AuthState, LoginInput, SignupInput } from "../types";
import * as api from "../services/api";

interface AuthContextType extends AuthState {
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    fullName?: string;
    companyName?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    recruiter: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getStoredToken();
      const recruiter = api.getStoredRecruiter();

      if (token && recruiter) {
        try {
          // Validate token by fetching profile
          const profile = await api.getProfile();
          setState({
            recruiter: profile,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token is invalid, clear storage
          api.clearAuthData();
          setState({
            recruiter: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { recruiter, token } = await api.login(input);
    setState({
      recruiter,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const { recruiter, token } = await api.signup(input);
    setState({
      recruiter,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setState({
      recruiter: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateProfile = useCallback(
    async (data: { fullName?: string; companyName?: string }) => {
      const updatedRecruiter = await api.updateProfile(data);
      setState((prev) => ({
        ...prev,
        recruiter: updatedRecruiter,
      }));
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
