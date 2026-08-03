import { lazy, Suspense, useEffect } from "react";
import { AppShell } from "./AppShell";
import { ReviewBookmarksProvider } from "../features/credit-reviews/bookmarks/ReviewBookmarks";
import { RouterProvider, useRouter } from "./router";
import styles from "./App.module.css";

const OverviewPage = lazy(() => import("../features/overview/OverviewPage").then((module) => ({ default: module.OverviewPage })));
const DesignSystemPage = lazy(() => import("../features/design-system/DesignSystemPage").then((module) => ({ default: module.DesignSystemPage })));
const CreditReviewsPage = lazy(() => import("../features/credit-reviews/CreditReviewsPage").then((module) => ({ default: module.CreditReviewsPage })));
const SeniorReviewsPage = lazy(() => import("../features/credit-reviews/senior/SeniorReviewsPage").then((module) => ({ default: module.SeniorReviewsPage })));
const StandardSeniorReviewPage = lazy(() => import("../features/credit-reviews/senior/StandardSeniorReviewPage").then((module) => ({ default: module.StandardSeniorReviewPage })));
const MeridianReviewWorkspace = lazy(() => import("../features/credit-reviews/workspace/MeridianReviewWorkspace").then((module) => ({ default: module.MeridianReviewWorkspace })));
const NorthstarReviewWorkspace = lazy(() => import("../features/credit-reviews/northstar/NorthstarReviewWorkspace").then((module) => ({ default: module.NorthstarReviewWorkspace })));
const NorthstarSeniorReviewPage = lazy(() => import("../features/credit-reviews/senior/NorthstarSeniorReviewPage").then((module) => ({ default: module.NorthstarSeniorReviewPage })));
const StandardReviewWorkspace = lazy(() => import("../features/credit-reviews/standard/StandardReviewWorkspace").then((module) => ({ default: module.StandardReviewWorkspace })));
const IntelligencePage = lazy(() => import("../features/intelligence/IntelligencePage").then((module) => ({ default: module.IntelligencePage })));
const ReimbursementsPage = lazy(() => import("../features/reimbursements/ReimbursementsPage").then((module) => ({ default: module.ReimbursementsPage })));
const PolicyRulesPage = lazy(() => import("../features/policy-rules/PolicyRulesPage").then((module) => ({ default: module.PolicyRulesPage })));

export function App() {
  useInputModality();

  return (
    <RouterProvider>
      <ReviewBookmarksProvider>
        <AppRoutes />
      </ReviewBookmarksProvider>
    </RouterProvider>
  );
}

function useInputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const setInputModality = (modality: "keyboard" | "pointer") => {
      root.dataset.inputModality = modality;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") setInputModality("keyboard");
      // Escape commonly closes a pointer-opened drawer, popover, or design
      // surface and returns focus to its launcher. Treat that return as a
      // managed focus handoff so the launcher does not retain a keyboard ring
      // until the user explicitly resumes keyboard navigation with Tab.
      if (event.key === "Escape") setInputModality("pointer");
    };
    const handlePointerDown = () => setInputModality("pointer");

    setInputModality("pointer");
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      delete root.dataset.inputModality;
    };
  }, []);
}

function AppRoutes() {
  const { pathname } = useRouter();
  const standardSenior = pathname.includes("/senior-decision/review") && !pathname.startsWith("/credit-reviews/meridian-foods") && !pathname.startsWith("/credit-reviews/northstar-health");
  const page = standardSenior
    ? <StandardSeniorReviewPage />
    : pathname === "/credit-reviews/northstar-health/senior-decision/review"
      ? <NorthstarSeniorReviewPage />
    : pathname.startsWith("/credit-reviews/meridian-foods")
    ? <MeridianReviewWorkspace />
    : pathname.startsWith("/credit-reviews/northstar-health")
      ? <NorthstarReviewWorkspace />
    : pathname === "/credit-reviews/senior"
      ? <SeniorReviewsPage />
    : pathname.startsWith("/credit-reviews/")
      ? <StandardReviewWorkspace />
    : pathname === "/design-system"
    ? <DesignSystemPage />
    : pathname === "/intelligence"
      ? <IntelligencePage />
    : pathname === "/reimbursements"
      ? <ReimbursementsPage />
    : pathname === "/credit-reviews"
      ? <CreditReviewsPage />
    : pathname.startsWith("/policy-rules")
      ? <PolicyRulesPage />
    : pathname === "/overview" || pathname === "/"
      ? <OverviewPage />
      : <OverviewPage />;

  return (
    <AppShell>
      <Suspense fallback={<div className={styles.routeLoading} role="status">Loading workspace…</div>}>
        {page}
      </Suspense>
    </AppShell>
  );
}
