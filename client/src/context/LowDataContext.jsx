import React, { createContext, useContext, useState, useEffect } from 'react';

const LowDataContext = createContext();

export const LowDataProvider = ({ children }) => {
  const [lowDataMode, setLowDataMode] = useState(() => {
    return localStorage.getItem('arogya_low_data') === 'true';
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('arogya_low_data', lowDataMode);
    if (lowDataMode) {
      document.documentElement.classList.add('low-data-mode');
    } else {
      document.documentElement.classList.remove('low-data-mode');
    }
  }, [lowDataMode]);

  const toggleLowDataMode = () => {
    setLowDataMode((prev) => !prev);
  };

  // Facility caching helper for low-bandwidth environments
  const cacheFacilities = (data) => {
    try {
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('arogya_cached_facilities', JSON.stringify({
          timestamp: Date.now(),
          facilities: data.slice(0, 20),
        }));
      }
    } catch (e) {
      console.warn('Facility cache limit reached:', e);
    }
  };

  const getCachedFacilities = () => {
    try {
      const cached = localStorage.getItem('arogya_cached_facilities');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  return (
    <LowDataContext.Provider
      value={{
        lowDataMode,
        toggleLowDataMode,
        isOnline,
        cacheFacilities,
        getCachedFacilities,
      }}
    >
      {children}
    </LowDataContext.Provider>
  );
};

export const useLowData = () => {
  const context = useContext(LowDataContext);
  if (!context) {
    throw new Error('useLowData must be used within a LowDataProvider');
  }
  return context;
};

export default LowDataContext;
