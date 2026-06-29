import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFLINE_PACKAGE_KEY = "ondo_offline_package";
const QUEUED_VOTES_KEY = "ondo_queued_votes";

/**
 * Stores the signed offline voting package (candidates + offlineToken) fetched
 * while online, so a vote can still be cast locally if connectivity drops later.
 */
export async function saveOfflinePackage(pkg) {
  await AsyncStorage.setItem(OFFLINE_PACKAGE_KEY, JSON.stringify(pkg));
}

export async function getOfflinePackage() {
  const raw = await AsyncStorage.getItem(OFFLINE_PACKAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearOfflinePackage() {
  await AsyncStorage.removeItem(OFFLINE_PACKAGE_KEY);
}

/**
 * Queues a vote that couldn't be submitted online, to be synced later.
 */
export async function queueVote(vote) {
  const existing = await getQueuedVotes();
  const updated = [...existing, vote];
  await AsyncStorage.setItem(QUEUED_VOTES_KEY, JSON.stringify(updated));
}

export async function getQueuedVotes() {
  const raw = await AsyncStorage.getItem(QUEUED_VOTES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearQueuedVotes() {
  await AsyncStorage.removeItem(QUEUED_VOTES_KEY);
}

export async function removeQueuedVote(offlineVoteId) {
  const existing = await getQueuedVotes();
  const updated = existing.filter((v) => v.offlineVoteId !== offlineVoteId);
  await AsyncStorage.setItem(QUEUED_VOTES_KEY, JSON.stringify(updated));
}
