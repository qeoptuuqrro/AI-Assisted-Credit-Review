import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { reviews, type CreditReview } from "../reviewData";

export type ReviewBookmarkSlug = CreditReview["slug"];

type ReviewBookmarksValue = {
  bookmarkedSlugs: ReviewBookmarkSlug[];
  bookmarkedReviews: CreditReview[];
  isBookmarked: (slug: ReviewBookmarkSlug) => boolean;
  toggleBookmark: (slug: ReviewBookmarkSlug) => void;
  removeBookmark: (slug: ReviewBookmarkSlug) => void;
  reorderBookmark: (source: ReviewBookmarkSlug, target: ReviewBookmarkSlug) => void;
};

const STORAGE_KEY = "bcgx.credit-review-bookmarks.v1";
const DEFAULT_BOOKMARKS: ReviewBookmarkSlug[] = ["meridian-foods", "northstar-health"];
const validSlugs = new Set<ReviewBookmarkSlug>(reviews.map((review) => review.slug));
const ReviewBookmarksContext = createContext<ReviewBookmarksValue | null>(null);

function readBookmarks(): ReviewBookmarkSlug[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_BOOKMARKS;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_BOOKMARKS;
    return [...new Set(parsed.filter((slug): slug is ReviewBookmarkSlug => typeof slug === "string" && validSlugs.has(slug as ReviewBookmarkSlug)))];
  } catch {
    return DEFAULT_BOOKMARKS;
  }
}

export function ReviewBookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<ReviewBookmarkSlug[]>(readBookmarks);

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setBookmarkedSlugs(readBookmarks());
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarkedSlugs));
    } catch {
      // The in-memory state remains usable when storage is unavailable.
    }
  }, [bookmarkedSlugs]);

  const isBookmarked = useCallback((slug: ReviewBookmarkSlug) => bookmarkedSlugs.includes(slug), [bookmarkedSlugs]);

  const toggleBookmark = useCallback((slug: ReviewBookmarkSlug) => {
    setBookmarkedSlugs((current) => current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug]);
  }, []);

  const removeBookmark = useCallback((slug: ReviewBookmarkSlug) => {
    setBookmarkedSlugs((current) => current.filter((item) => item !== slug));
  }, []);

  const reorderBookmark = useCallback((source: ReviewBookmarkSlug, target: ReviewBookmarkSlug) => {
    if (source === target) return;
    setBookmarkedSlugs((current) => {
      const sourceIndex = current.indexOf(source);
      const targetIndex = current.indexOf(target);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, source);
      return next;
    });
  }, []);

  const bookmarkedReviews = useMemo(() => bookmarkedSlugs
    .map((slug) => reviews.find((review) => review.slug === slug))
    .filter((review): review is CreditReview => Boolean(review)), [bookmarkedSlugs]);

  const value = useMemo<ReviewBookmarksValue>(() => ({
    bookmarkedSlugs,
    bookmarkedReviews,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    reorderBookmark,
  }), [bookmarkedReviews, bookmarkedSlugs, isBookmarked, removeBookmark, reorderBookmark, toggleBookmark]);

  return <ReviewBookmarksContext.Provider value={value}>{children}</ReviewBookmarksContext.Provider>;
}

export function useReviewBookmarks() {
  const value = useContext(ReviewBookmarksContext);
  if (!value) throw new Error("useReviewBookmarks must be used within ReviewBookmarksProvider");
  return value;
}
