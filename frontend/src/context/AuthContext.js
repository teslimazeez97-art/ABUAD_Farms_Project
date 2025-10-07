import React from "react";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = React.useState(() => localStorage.getItem("auth_token") || "");

  const login = (userObj, jwt) => {
    setUser(userObj);
    setToken(jwt);
    localStorage.setItem("auth_user", JSON.stringify(userObj));
    localStorage.setItem("auth_token", jwt);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}