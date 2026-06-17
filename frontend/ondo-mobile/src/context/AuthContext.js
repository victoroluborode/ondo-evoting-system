import React, { createContext, useMemo, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // role can be: null, 'voter', 'officer', or 'admin'.
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);

  // Stores the active role after a successful login.
  const loginRole = (role, data = null) => {
    setUserRole(role);
    setUserData(data);
  };

  // Clears the authenticated session and returns to entry screens.
  const logout = () => {
    setUserRole(null);
    setUserData(null);
  };

  const value = useMemo(() => ({
    userRole,
    userData,
    loginRole,
    logout,
  }), [userRole, userData]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
