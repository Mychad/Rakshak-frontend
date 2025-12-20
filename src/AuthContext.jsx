import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../src/ApiClient.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await ApiClient.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };


  const login = async (role, email, password) => {
    const response = await ApiClient.post("/auth/login", {
      role,
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    setUser(user); // instant UX

    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
