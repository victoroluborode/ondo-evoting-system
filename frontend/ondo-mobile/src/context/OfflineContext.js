import React, { createContext, useEffect, useMemo, useState } from 'react';

export const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingVotes, setPendingVotes] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);

  useEffect(() => {
    // Later this can be replaced with NetInfo and AsyncStorage persistence.
  }, []);

  // Stores encrypted votes locally until network sync is available.
  const addToVoteQueue = (encryptedVote) => {
    setPendingVotes((current) => [...current, encryptedVote]);
  };

  // Stores completed officer registrations locally for later sync.
  const addToRegistrationQueue = (registration) => {
    setPendingRegistrations((current) => [...current, registration]);
  };

  // Simulates a batch sync against the backend sync endpoint.
  const syncQueue = async () => {
    if (isOffline) return false;
    setPendingVotes([]);
    setPendingRegistrations([]);
    return true;
  };

  const value = useMemo(() => ({
    isOffline,
    setIsOffline,
    pendingVotes,
    pendingRegistrations,
    addToVoteQueue,
    addToRegistrationQueue,
    syncQueue,
  }), [isOffline, pendingVotes, pendingRegistrations]);

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}
