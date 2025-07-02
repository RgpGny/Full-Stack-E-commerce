import { createContext, useState, useEffect } from "react";
import { checkAuth, logoutUser } from "../utils/Api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authData = await checkAuth();
        setIsAuthenticated(authData.isAuthenticated);
        setUser(authData.user);
      } catch (error) {
        console.error("verifyAuth error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const setAuthData = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        user,
        setIsAuthenticated, 
        setAuthData,
        loading, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
