import { createContext, useContext, useReducer, useEffect } from 'react';
import { authReducer, initialState } from './AuthReducer';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sync token and user to localStorage whenever they change
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [state.token, state.user]);

  const login = (token, user) => {
    dispatch({ type: 'LOGIN', payload: { token, user } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (updatedUser) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};