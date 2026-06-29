import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../services/api";

/**
 * Fetches the real constituency/LGA list once and exposes lookup helpers,
 * so screens never display raw numeric IDs to the user.
 */
export function useConstituencyLookup() {
  const [constituencies, setConstituencies] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await apiRequest("/ballots/constituencies");
      setConstituencies(data.constituencies);
    } catch (err) {
      console.error("Failed to load constituency lookup:", err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getConstituencyName = useCallback(
    (id) => {
      if (!constituencies) return null;
      const match = constituencies.find((c) => c.id === Number(id));
      return match?.name || null;
    },
    [constituencies],
  );

  const getLgaName = useCallback(
    (constituencyId, lgaId) => {
      if (!constituencies) return null;
      const constituency = constituencies.find(
        (c) => c.id === Number(constituencyId),
      );
      const lga = constituency?.lgas?.find((l) => l.id === Number(lgaId));
      return lga?.name || null;
    },
    [constituencies],
  );

  return {
    constituencies,
    loading: !constituencies,
    getConstituencyName,
    getLgaName,
    reload: load,
  };
}
