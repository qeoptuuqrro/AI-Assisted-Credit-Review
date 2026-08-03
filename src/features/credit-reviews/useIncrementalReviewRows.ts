import { useCallback, useEffect, useRef, useState } from "react";

const LOAD_MORE_DELAY_MS = 500;

type UseIncrementalReviewRowsOptions = {
  enabled: boolean;
  total: number;
  initialCount: number;
  batchSize: number;
  resetKey: string;
};

export function useIncrementalReviewRows({ enabled, total, initialCount, batchSize, resetKey }: UseIncrementalReviewRowsOptions) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadedCount, setLastLoadedCount] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadTimerRef = useRef<number | null>(null);
  const hasMore = visibleCount < total;

  const cancelPendingLoad = useCallback(() => {
    if (loadTimerRef.current === null) return;
    window.clearTimeout(loadTimerRef.current);
    loadTimerRef.current = null;
  }, []);

  const loadMore = useCallback(() => {
    if (!enabled || !hasMore || loadTimerRef.current !== null) return;
    const nextBatchCount = Math.min(batchSize, total - visibleCount);
    setIsLoadingMore(true);
    loadTimerRef.current = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + batchSize, total));
      setLastLoadedCount(nextBatchCount);
      setIsLoadingMore(false);
      loadTimerRef.current = null;
    }, LOAD_MORE_DELAY_MS);
  }, [batchSize, enabled, hasMore, total, visibleCount]);

  useEffect(() => {
    cancelPendingLoad();
    setVisibleCount(Math.min(initialCount, total));
    setIsLoadingMore(false);
    setLastLoadedCount(0);
  }, [cancelPendingLoad, initialCount, resetKey, total]);

  useEffect(() => {
    if (!enabled || !hasMore || isLoadingMore || typeof IntersectionObserver === "undefined") return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    }, { rootMargin: "0px 0px 80px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, hasMore, isLoadingMore, loadMore]);

  useEffect(() => cancelPendingLoad, [cancelPendingLoad]);

  return {
    visibleCount: Math.min(visibleCount, total),
    hasMore,
    hasLoadedMore: visibleCount > Math.min(initialCount, total),
    isLoadingMore,
    lastLoadedCount,
    sentinelRef,
    loadMore,
  };
}
