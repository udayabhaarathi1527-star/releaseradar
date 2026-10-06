/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verifyToken = useCallback(async (storedToken) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/verify",
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        setToken(storedToken);
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      // Token verification intentionally updates authentication state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void verifyToken(storedToken);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [verifyToken]);

  const register = async (name, email, password) => {
    try {
      setError(null);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password }
      );

      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${newToken}`;

      return { success: true };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

      setError(errorMsg);

      return { success: false, error: errorMsg };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${newToken}`;

      return { success: true };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";

      setError(errorMsg);

      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isLoading: loading,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth };