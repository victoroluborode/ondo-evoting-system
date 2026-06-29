import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { apiRequest } from "../services/api";
import {
  getQueuedVotes,
  removeQueuedVote,
  getOfflinePackage,
  clearOfflinePackage,
} from "../services/offlineVoteStore";

/**
 * Watches for connectivity and attempts to sync any locally queued votes
 * whenever the device comes back online.
 */
export function useOfflineSync() {
  const syncing = useRef(false);

  useEffect(() => {
    const attemptSync = async () => {
      if (syncing.current) return;

      const queued = await getQueuedVotes();
      if (queued.length === 0) return;

      const offlinePkg = await getOfflinePackage();
      if (!offlinePkg) return;

      syncing.current = true;

      try {
        const response = await apiRequest("/votes/sync", {
          method: "POST",
          body: JSON.stringify({
            offlineToken: offlinePkg.offlineToken,
            votes: queued,
          }),
        });

        for (const syncedVote of response.synced) {
          if (
            syncedVote.status === "accepted" ||
            syncedVote.status === "duplicate"
          ) {
            await removeQueuedVote(syncedVote.offlineVoteId);
          }
          // 'rejected' entries are left in the queue deliberately — see note below.
        }

        const remaining = await getQueuedVotes();
        if (remaining.length === 0) {
          await clearOfflinePackage();
        }
      } catch (err) {
        console.warn(
          "Offline vote sync failed, will retry later:",
          err.message,
        );
      } finally {
        syncing.current = false;
      }
    };

    attemptSync();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        attemptSync();
      }
    });

    return () => unsubscribe();
  }, []);
}
