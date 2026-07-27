import { Icon } from "../../../shared/ui/Icon/Icon";
import { useReviewBookmarks, type ReviewBookmarkSlug } from "./ReviewBookmarks";
import styles from "./ReviewBookmarkButton.module.css";

type ReviewBookmarkButtonProps = {
  slug: ReviewBookmarkSlug;
  company: string;
};

export function ReviewBookmarkButton({ slug, company }: ReviewBookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useReviewBookmarks();
  const bookmarked = isBookmarked(slug);
  const label = bookmarked ? `Remove ${company} from bookmarks` : `Add ${company} to bookmarks`;

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      aria-pressed={bookmarked}
      title={label}
      onClick={() => toggleBookmark(slug)}
    >
      <Icon name="bookmark" size="sm" fill={bookmarked ? "currentColor" : "none"} />
    </button>
  );
}
