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

  // Load auth from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.accessToken) {
          dispatch({ type: "LOGIN", payload: parsed });
        } else {
          dispatch({ type: "LOADED" });
        }
      } catch (e) {
        console.error("Failed to parse auth data");
        dispatch({ type: "LOADED" });
      }
    } else {
      dispatch({ type: "LOADED" });
    }
  }, []);

  const login = (payload) => {
    try {
      localStorage.setItem("auth", JSON.stringify(payload));
      dispatch({ type: "LOGIN", payload });
      console.log("✅ Login successful, context updated");
    } catch (err) {
      console.error("Login context error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth");
    dispatch({ type: "LOGOUT" });
  };

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
