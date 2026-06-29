// src/hooks/useNetworkRequest.js — corrected
import { useState, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useNetworkRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  const execute = useCallback(async (asyncFn) => {
    setError(null);
    setErrorType(null);
    setLoading(true);

    try {
      // Attempt the request directly. Do NOT gate on NetInfo first —
      // NetInfo can report false negatives on physical devices via Expo Go,
      // which was incorrectly blocking valid requests before they ever fired.
      const result = await asyncFn();
      return { success: true, data: result };
    } catch (err) {
      console.log(
        "[useNetworkRequest] caught error:",
        err.message,
        "status:",
        err.status,
      );

      // Only classify as a network error if the request never reached the server
      // (no HTTP status at all) AND it matches a real fetch failure signature.
      const isNetworkError =
        err.status === undefined &&
        (err.message === "Network request failed" ||
          err.message?.toLowerCase().includes("failed to fetch") ||
          err.message?.toLowerCase().includes("timeout"));

      if (isNetworkError) {
        setError(
          "Unable to reach the server. Check your connection and try again.",
        );
        setErrorType("network");
        return { success: false, errorType: "network", error: err };
      }

      // Everything else (including 401s, validation errors, or mock-thrown errors)
      // is treated as a server/logic error, not a connectivity problem.
      setError(err.message || "Something went wrong. Please try again.");
      setErrorType("server");
      return { success: false, errorType: "server", error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error, errorType, clearError };
}
