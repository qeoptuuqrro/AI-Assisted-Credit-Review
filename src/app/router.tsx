import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { standardReviewSlugs, type StandardReviewPath } from "../features/credit-reviews/reviewData";

export type AppPath =
  | "/"
  | "/overview"
  | "/intelligence"
  | "/reimbursements"
  | "/credit-reviews"
  | "/policy-rules"
  | "/policy-rules/leverage-ceiling"
  | "/credit-reviews/senior"
  | "/credit-reviews/northstar-health"
  | "/credit-reviews/northstar-health/findings"
  | "/credit-reviews/northstar-health/financials"
  | "/credit-reviews/northstar-health/sources"
  | "/credit-reviews/northstar-health/activity"
  | "/credit-reviews/northstar-health/recommendation"
  | "/credit-reviews/northstar-health/senior-decision/review"
  | "/credit-reviews/meridian-foods"
  | "/credit-reviews/meridian-foods/findings"
  | "/credit-reviews/meridian-foods/findings/customer-concentration"
  | "/credit-reviews/meridian-foods/findings/declining-margins"
  | "/credit-reviews/meridian-foods/findings/increasing-leverage"
  | "/credit-reviews/meridian-foods/financials"
  | "/credit-reviews/meridian-foods/sources"
  | "/credit-reviews/meridian-foods/activity"
  | "/credit-reviews/meridian-foods/recommendation"
  | "/credit-reviews/meridian-foods/recommendation/draft"
  | "/credit-reviews/meridian-foods/senior-decision"
  | "/credit-reviews/meridian-foods/senior-decision/review"
  | StandardReviewPath
  | "/design-system";

const standardCreditReviewPaths = standardReviewSlugs.flatMap((slug) => [
  `/credit-reviews/${slug}`,
  `/credit-reviews/${slug}/findings`,
  `/credit-reviews/${slug}/sources`,
  `/credit-reviews/${slug}/activity`,
  `/credit-reviews/${slug}/recommendation`,
  `/credit-reviews/${slug}/senior-decision/review`,
] as StandardReviewPath[]);

const creditReviewPaths: AppPath[] = [
  "/credit-reviews/senior",
  "/credit-reviews/northstar-health",
  "/credit-reviews/northstar-health/findings",
  "/credit-reviews/northstar-health/financials",
  "/credit-reviews/northstar-health/sources",
  "/credit-reviews/northstar-health/activity",
  "/credit-reviews/northstar-health/recommendation",
  "/credit-reviews/northstar-health/senior-decision/review",
  "/credit-reviews/meridian-foods",
  "/credit-reviews/meridian-foods/findings",
  "/credit-reviews/meridian-foods/findings/customer-concentration",
  "/credit-reviews/meridian-foods/findings/declining-margins",
  "/credit-reviews/meridian-foods/findings/increasing-leverage",
  "/credit-reviews/meridian-foods/financials",
  "/credit-reviews/meridian-foods/sources",
  "/credit-reviews/meridian-foods/activity",
  "/credit-reviews/meridian-foods/recommendation",
  "/credit-reviews/meridian-foods/recommendation/draft",
  "/credit-reviews/meridian-foods/senior-decision",
  "/credit-reviews/meridian-foods/senior-decision/review",
  ...standardCreditReviewPaths,
];

type RouterValue = {
  pathname: AppPath;
  search: string;
  navigate: (to: AppPath, options?: { search?: string; replace?: boolean }) => void;
};

const RouterContext = createContext<RouterValue | null>(null);

const appBasePath = import.meta.env.BASE_URL === "/"
  ? ""
  : import.meta.env.BASE_URL.replace(/\/$/, "");

export function createAppHref(pathname: AppPath, search = "") {
  return `${appBasePath}${pathname}${search}`;
}

function stripAppBasePath(pathname: string) {
  const pathWithoutBase = !appBasePath
    ? pathname
    : pathname === appBasePath || pathname === `${appBasePath}/`
      ? "/"
      : pathname.startsWith(`${appBasePath}/`)
        ? pathname.slice(appBasePath.length)
        : pathname;
  return pathWithoutBase.length > 1 ? pathWithoutBase.replace(/\/+$/, "") : pathWithoutBase;
}

function readBrowserLocation() {
  return {
    pathname: resolvePathname(stripAppBasePath(window.location.pathname)),
    search: window.location.search,
  };
}

function resolvePathname(pathname: string): AppPath {
  if (creditReviewPaths.includes(pathname as AppPath)) return pathname as AppPath;
  if (pathname === "/credit-reviews") return "/credit-reviews";
  if (pathname === "/policy-rules" || pathname === "/policy-rules/leverage-ceiling") return pathname;
  if (pathname === "/intelligence") return "/intelligence";
  if (pathname === "/reimbursements") return "/reimbursements";
  if (pathname === "/overview") return "/overview";
  return pathname === "/design-system" || pathname === "/foundations" ? "/design-system" : "/";
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(readBrowserLocation);

  useEffect(() => {
    if (stripAppBasePath(window.location.pathname) === "/foundations") {
      window.history.replaceState({}, "", createAppHref("/design-system"));
    }
    const handlePopState = () => setLocation(readBrowserLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const value = useMemo<RouterValue>(() => ({
    pathname: location.pathname,
    search: location.search,
    navigate(to, options) {
      const search = options?.search ?? "";
      if (to === location.pathname && search === location.search) return;
      window.history[options?.replace ? "replaceState" : "pushState"]({}, "", createAppHref(to, search));
      setLocation({ pathname: to, search });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
  }), [location]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useRouter must be used within RouterProvider");
  return router;
}

type AppLinkProps = {
  to: AppPath;
  search?: string;
  className?: string;
  "aria-current"?: "page";
  "aria-label"?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
};

export function AppLink(props: AppLinkProps) {
  const { to, search = "", className, children } = props;
  const { navigate } = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    props.onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to, { search });
  }

  return (
    <a
      href={createAppHref(to, search)}
      className={className}
      aria-current={props["aria-current"]}
      aria-label={props["aria-label"]}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
