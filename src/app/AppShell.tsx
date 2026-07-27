import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import { DesignToolsLauncher } from "../features/design-tools/DesignToolsLauncher";
import { getDesignOption } from "../features/design-tools/designOptions";
import { DesignRationalePanel } from "../features/design-rationale/DesignRationalePanel";
import { getAIReviewLabel } from "../features/credit-reviews/reviewData";
import { useReviewBookmarks, type ReviewBookmarkSlug } from "../features/credit-reviews/bookmarks/ReviewBookmarks";
import { companyLogoDomains } from "../features/credit-reviews/companyLogos";
import { applyCreditReviewWorkflowState } from "../features/credit-reviews/creditReviewPresentation";
import { createInitialMeridianState, createInitialNorthstarState } from "../features/credit-reviews/workflow/creditReviewState";
import { MERIDIAN_STORAGE_KEY, NORTHSTAR_STORAGE_KEY, readPersistedReviewState, useReviewWorkflowRevision } from "../features/credit-reviews/workflow/usePersistentReviewState";
import { CompanyLogo } from "../shared/ui/CompanyLogo/CompanyLogo";
import { Icon } from "../shared/ui/Icon/Icon";
import { primaryNavigation } from "./navigation";
import { AppLink, useRouter, type AppPath } from "./router";
import { AppUtilityActionsProvider } from "./AppUtilityActions";
import { standardReviewSlugs } from "../features/credit-reviews/reviewData";
import { readPersistedStandardReviewState, standardReviewStorageKey } from "../features/credit-reviews/standard/standardReviewState";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { pathname, search } = useRouter();
  const { bookmarkedReviews, removeBookmark, reorderBookmark } = useReviewBookmarks();
  const [bookmarkHelpOpen, setBookmarkHelpOpen] = useState(false);
  const [mobileBookmarksOpen, setMobileBookmarksOpen] = useState(false);
  const [designRationaleOpen, setDesignRationaleOpen] = useState(false);
  const [draggedBookmark, setDraggedBookmark] = useState<ReviewBookmarkSlug | null>(null);
  const [utilityActionsTarget, setUtilityActionsTarget] = useState<HTMLDivElement | null>(null);
  const workflowRevision = useReviewWorkflowRevision([MERIDIAN_STORAGE_KEY, NORTHSTAR_STORAGE_KEY, ...standardReviewSlugs.map(standardReviewStorageKey)]);
  const focusedEvidenceReview = pathname === "/credit-reviews/meridian-foods/sources"
    && Boolean(new URLSearchParams(search).get("source"));
  const liveBookmarkedReviews = useMemo(() => {
    const meridianState = readPersistedReviewState(MERIDIAN_STORAGE_KEY, createInitialMeridianState());
    const northstarState = readPersistedReviewState(NORTHSTAR_STORAGE_KEY, createInitialNorthstarState());
    const standardStates = Object.fromEntries(standardReviewSlugs.map((slug) => [slug, readPersistedStandardReviewState(slug)]));
    return bookmarkedReviews.map((review) => applyCreditReviewWorkflowState(review, meridianState, northstarState, standardStates));
  }, [bookmarkedReviews, pathname, search, workflowRevision]);
  const immersiveDecisionReview = pathname === "/credit-reviews/meridian-foods/recommendation/draft"
    || pathname === "/credit-reviews/meridian-foods/senior-decision/review"
    || pathname.includes("/senior-decision/review");
  const focusedWorkspace = focusedEvidenceReview || immersiveDecisionReview;
  const selectedDesign = getDesignOption(new URLSearchParams(search).get("design"));
  const persistentDocumentationLabel = selectedDesign?.renderKey === "utility-documentation-label";

  useEffect(() => {
    setBookmarkHelpOpen(false);
    setMobileBookmarksOpen(false);
    setDesignRationaleOpen(false);
  }, [pathname]);

  return (
    <AppUtilityActionsProvider target={utilityActionsTarget}>
    <div className={`${styles.shell} ${focusedWorkspace ? styles.focusedShell : ""} ${immersiveDecisionReview ? styles.immersiveShell : ""}`}>
      {!immersiveDecisionReview && <header className={styles.demoBanner}>
        <div className={styles.demoMessage}>
          <span className={styles.demoMark} aria-hidden="true">B</span>
          <span>Explore the BCGX lending workspace.</span>
          <AppLink to="/design-system">Built with the Salt design system</AppLink>
        </div>
        <span className={styles.internalPill}>Internal workspace</span>
      </header>}

      {focusedWorkspace ? (
        <div className={`${styles.focusedWorkspace} ${immersiveDecisionReview ? styles.immersiveWorkspace : ""}`}>
          <main className={styles.focusedMain}>{children}</main>
        </div>
      ) : (
        <div className={styles.workspace}>
          <aside className={styles.sidebar}>
          <div className={styles.brand} aria-label="BCGX workspace">
            <span className={styles.brandMark}>B</span>
            <span>BCGX</span>
            <span className={styles.planBadge}>Pro</span>
            <Icon name="chevronDown" size="sm" />
          </div>

          <nav className={styles.navigation} aria-label="Primary navigation">
            {primaryNavigation.map((item) => (
              <AppLink
                key={item.to}
                to={item.to}
                className={`${styles.navigationItem} ${pathname === item.to || (item.to === "/" && pathname === "/overview") || (item.to === "/credit-reviews" && pathname.startsWith("/credit-reviews/")) ? styles.navigationItemActive : ""}`}
              >
                <Icon name={item.icon} size="sm" />
                <span>{item.label}</span>
                {item.badge && <span className={styles.navigationBadge}>{item.badge}</span>}
              </AppLink>
            ))}
          </nav>

          <div className={styles.sidebarDivider} />
          <section className={styles.sidebarSection} aria-labelledby="bookmarks-heading">
            <div className={styles.bookmarkSectionHeader}>
              <span className={styles.sectionLabel} id="bookmarks-heading">Bookmarks</span>
              <button
                type="button"
                className={styles.bookmarkHelpButton}
                aria-label="Learn about bookmarks"
                aria-expanded={bookmarkHelpOpen}
                onClick={() => setBookmarkHelpOpen((current) => !current)}
              >
                <Icon name="help" size="xs" />
              </button>
              {bookmarkHelpOpen && (
                <div className={styles.bookmarkHelp} role="dialog" aria-label="About bookmarks">
                  <strong>Add bookmarks from each page</strong>
                  <p>Use the bookmark icon near a review title to keep essential cases in your sidebar.</p>
                </div>
              )}
            </div>

            {liveBookmarkedReviews.length > 0 ? (
              <div className={styles.bookmarkList} aria-label="Bookmarks">
                {liveBookmarkedReviews.map((review, index) => {
                  const reviewPath = `/credit-reviews/${review.slug}` as AppPath;
                  const active = pathname === reviewPath || pathname.startsWith(`${reviewPath}/`);
                  return (
                    <div
                      className={`${styles.bookmarkRow} ${active ? styles.bookmarkRowActive : ""}`}
                      key={review.slug}
                      onDragOver={(event) => {
                        if (!draggedBookmark || draggedBookmark === review.slug) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (draggedBookmark) reorderBookmark(draggedBookmark, review.slug);
                        setDraggedBookmark(null);
                      }}
                    >
                      <button
                        type="button"
                        className={styles.bookmarkHandle}
                        draggable={liveBookmarkedReviews.length > 1}
                        aria-label={`Reorder ${review.company}. Use Arrow Up or Arrow Down.`}
                        onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                          setDraggedBookmark(review.slug);
                          event.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => setDraggedBookmark(null)}
                        onKeyDown={(event) => {
                          const targetIndex = event.key === "ArrowUp" ? index - 1 : event.key === "ArrowDown" ? index + 1 : -1;
                          const target = liveBookmarkedReviews[targetIndex];
                          if (!target) return;
                          event.preventDefault();
                          reorderBookmark(review.slug, target.slug);
                        }}
                      >
                        <Icon name="grip" size="sm" />
                      </button>
                      <AppLink className={styles.bookmarkLink} to={reviewPath}>
                        <CompanyLogo domain={companyLogoDomains[review.company]} name={review.company} />
                        <span className={styles.bookmarkCopy}>
                          <strong>{review.company}</strong>
                          <small>{review.request.split(" ")[0]} · {getAIReviewLabel(review)}</small>
                        </span>
                      </AppLink>
                      <button
                        type="button"
                        className={styles.bookmarkRemove}
                        aria-label={`Remove ${review.company} from bookmarks`}
                        onClick={() => removeBookmark(review.slug)}
                      >
                        <Icon name="close" size="xs" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.bookmarkEmpty}>Save a review from its case header.</p>
            )}
          </section>

          <div className={styles.sidebarFooter}>
            <span className={styles.avatar} aria-hidden="true">J</span>
            <span className={styles.profileCopy}>
              <strong>Junha</strong>
              <small>Workspace owner</small>
            </span>
          </div>
          </aside>

          <div className={styles.contentColumn}>
            <div className={styles.utilityBar}>
              <span className={styles.searchPrompt}><Icon name="search" size="sm" /> Search for anything</span>
              <div className={styles.utilityActions}>
                <div className={styles.utilityExtension} ref={setUtilityActionsTarget} />
                <button
                  type="button"
                  className={`${styles.rationaleButton} ${persistentDocumentationLabel ? styles.rationaleButtonPersistent : ""}`}
                  aria-label="Open design rationale documentation"
                  aria-expanded={designRationaleOpen}
                  data-rationale-control
                  onClick={() => setDesignRationaleOpen((current) => !current)}
                >
                  <Icon name="book" size="sm" />
                  <span aria-hidden="true">Documentation</span>
                </button>
                <button
                  className={`${styles.iconButton} ${styles.mobileBookmarksButton}`}
                  type="button"
                  aria-label="Open bookmarks"
                  aria-expanded={mobileBookmarksOpen}
                  onClick={() => setMobileBookmarksOpen((current) => !current)}
                >
                  <Icon name="bookmark" size="sm" />
                </button>
                <button className={styles.iconButton} type="button" aria-label="Notifications"><Icon name="bell" size="sm" /></button>
                <span className={styles.utilityAvatar} aria-hidden="true">J</span>
              </div>
              {mobileBookmarksOpen && (
                <div className={styles.mobileBookmarkMenu} role="dialog" aria-label="Saved credit reviews">
                  <header><strong>Bookmarks</strong><button type="button" aria-label="Close bookmarks" onClick={() => setMobileBookmarksOpen(false)}><Icon name="close" size="sm" /></button></header>
                  {liveBookmarkedReviews.length > 0 ? liveBookmarkedReviews.map((review) => (
                    <AppLink key={review.slug} to={`/credit-reviews/${review.slug}` as AppPath} className={styles.mobileBookmarkLink}>
                      <CompanyLogo domain={companyLogoDomains[review.company]} name={review.company} />
                      <span><strong>{review.company}</strong><small>{review.request.split(" ")[0]} · {getAIReviewLabel(review)}</small></span>
                      <Icon name="chevronRight" size="sm" />
                    </AppLink>
                  )) : <p>Save a review from its case header.</p>}
                </div>
              )}
            </div>

            <main className={styles.main}>
              {children}
            </main>
            <DesignRationalePanel open={designRationaleOpen} pathname={pathname} onClose={() => setDesignRationaleOpen(false)} />
          </div>
        </div>
      )}
      {!focusedWorkspace && <DesignToolsLauncher />}
    </div>
    </AppUtilityActionsProvider>
  );
}
