"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/client/fetch";

interface Org {
  id: number;
  name: string;
  nameId: string;
  role: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  orgs: Org[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setIsAuthenticated: (status: boolean) => void;
}

const defaultContext: AuthContextType = {
  user: null,
  login: async () => Promise.reject("Not implemented"),
  register: async () => Promise.reject("Not implemented"),
  logout: async () => Promise.reject("Not implemented"),
  isAuthenticated: false,
  setIsAuthenticated: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchApi<User>("/me");
        if (data.email) {
          console.log("User authorized");
          setIsAuthenticated(true);
          setUser(data);
          console.log("user orgs fetched in auth context", data?.orgs);
        }
      } catch (error) {
        console.error("User not authorized");
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const data = await fetchApi<User>("auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!data.email) {
        throw new Error("Login failed: Invalid response");
      }

      setUser(data);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      // Re-throw the error to be handled by the component
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Login failed. Please try again.");
      }
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<User> => {
    try {
      const response = await fetchApi<User>("auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      console.log("response from backend", response);

      setUser(response);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetchApi("auth/logout", { method: "DELETE" });
      setUser(null);
      setIsAuthenticated(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
