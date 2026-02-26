import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: "ADMIN" | "TESTER" | "DEVELOPER";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));

    setUser({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
