import { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveToken = (token) => {
    localStorage.setItem("token", token);
  };

  const clearToken = () => {
    localStorage.removeItem("token");
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    saveToken(token);
    return userCredential;
  }

  async function logout() {
    try {
      await signOut(auth);
      clearToken();
      // Force a full page refresh to clear all state
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
      // Still refresh even if there was an error signing out
      window.location.reload();
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        saveToken(token);
      } else {
        clearToken();
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}