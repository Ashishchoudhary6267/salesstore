import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const AppProvider = ({ children }) => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [usePlaceholders, setUsePlaceholders] = useState(true);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading before showing the app
    if (!authLoading) {
      // Add a small delay to ensure all contexts are ready
      const timer = setTimeout(() => {
        setIsAppReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  const togglePlaceholders = () => setUsePlaceholders((v) => !v);

  return (
    <AppContext.Provider value={{ isAppReady, usePlaceholders, togglePlaceholders }}>
      {isAppReady ? children : (
        <div className="loading-container bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export default AppProvider;
