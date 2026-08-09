import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiCoachRequestWithClient } from "../lib/api-types";

export const useCoachRequests = () => {
  const [pending, setPending] = useState<ApiCoachRequestWithClient[]>([]);
  const [accepted, setAccepted] = useState<ApiCoachRequestWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        apiClient.get<{ data: ApiCoachRequestWithClient[] }>(
          "/coach-requests/pending",
        ),
        apiClient.get<{ data: ApiCoachRequestWithClient[] }>(
          "/coach-requests/accepted",
        ),
      ]);
      if (!isMounted.current) return;
      setPending(pendingRes.data.data);
      setAccepted(acceptedRes.data.data);
      setError(null);
    } catch {
      if (isMounted.current) setError("Failed to load your requests");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const respond = async (requestId: string, action: "accept" | "decline") => {
    await apiClient.patch(`/coach-requests/${requestId}/${action}`);
    await load();
  };

  return { pending, accepted, isLoading, error, respond, reload: load };
};
