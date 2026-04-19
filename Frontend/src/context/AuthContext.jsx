import { createContext, useContext, useReducer, useEffect } from "react";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || null,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "LOADED":
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: "LOGIN", payload: parsed });
      } else {
        dispatch({ type: "LOADED" });
      }
    } catch (err) {
      console.error("Auth loading error:", err);
      dispatch({ type: "LOADED" });
    }
  }, []);

  const login = (payload) => {
    localStorage.setItem("auth", JSON.stringify(payload));
    dispatch({ type: "LOGIN", payload });
  };

  const logout = () => {
    localStorage.removeItem("auth");
    dispatch({ type: "LOGOUT" });
  };

  // Extra safety: Re-check localStorage whenever component mounts
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.accessToken && !state.accessToken) {
            dispatch({ type: "LOGIN", payload: parsed });
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [state.accessToken]);

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
