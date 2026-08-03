import type { IconName } from "../../shared/ui/Icon/Icon";
import type { ReviewCompanyName } from "../credit-reviews/companyLogos";

export type ContextCategory = "Reviews" | "Findings" | "Sources" | "Portfolio";

type IntelligenceContextBase = {
  id: string;
  label: string;
  detail: string;
};

type ReviewIntelligenceContext = IntelligenceContextBase & {
  category: "Reviews";
  company: ReviewCompanyName;
};

type SemanticIntelligenceContext = IntelligenceContextBase & {
  category: Exclude<ContextCategory, "Reviews">;
  icon: IconName;
};

export type IntelligenceContext = ReviewIntelligenceContext | SemanticIntelligenceContext;

export const contextCategories: ContextCategory[] = ["Reviews", "Findings", "Sources", "Portfolio"];

export const intelligenceContexts: IntelligenceContext[] = [
  {
    id: "meridian-foods",
    label: "Meridian Foods",
    detail: "$18M working-capital line · Needs judgment",
    category: "Reviews",
    company: "Meridian Foods",
  },
  {
    id: "northstar-health",
    label: "Northstar Health",
    detail: "$15M revolving line · Needs verification",
    category: "Reviews",
    company: "Northstar Health",
  },
  {
    id: "customer-concentration",
    label: "Customer concentration",
    detail: "Meridian Foods · Updated to Moderate risk",
    category: "Findings",
    icon: "alertCircle",
  },
  {
    id: "declining-margins",
    label: "Declining margins",
    detail: "Meridian Foods · Needs judgment",
    category: "Findings",
    icon: "trendDown",
  },
  {
    id: "increasing-leverage",
    label: "Increasing leverage",
    detail: "Meridian Foods · Downside sensitivity",
    category: "Findings",
    icon: "chart",
  },
  {
    id: "customer-a-renewal",
    label: "Customer A renewal agreement",
    detail: "Contract · Renewed through March 2030",
    category: "Sources",
    icon: "document",
  },
  {
    id: "concentration-report",
    label: "Customer concentration report",
    detail: "Financial statements · Jun 30, 2026",
    category: "Sources",
    icon: "fileCheck",
  },
  {
    id: "revenue-forecast",
    label: "Revenue and margin forecast",
    detail: "Management forecast · Jun 30, 2026",
    category: "Sources",
    icon: "document",
  },
  {
    id: "my-reviews",
    label: "My reviews",
    detail: "12 active credit reviews",
    category: "Portfolio",
    icon: "clipboard",
  },
  {
    id: "needs-attention",
    label: "Needs attention",
    detail: "5 reviews with unresolved evidence or judgment",
    category: "Portfolio",
    icon: "filter",
  },
];

export const sourceDetails: Record<string, { label: string; meta: string; excerpt: string }> = {
  "customer-a-renewal": {
    label: "Customer A renewal agreement",
    meta: "Executed contract · Jul 18, 2026 · Page 2",
    excerpt: "The parties extend the term through March 31, 2030. All minimum-purchase provisions remain in effect.",
  },
  "concentration-report": {
    label: "Customer concentration report",
    meta: "Financial statements · Jun 30, 2026",
    excerpt: "Customer A represents 36% of net sales and Customer B represents 25%; the top two customers represent 61% in aggregate.",
  },
  "revenue-forecast": {
    label: "Revenue and margin forecast",
    meta: "Management forecast · Jun 30, 2026",
    excerpt: "Base-case EBITDA margin recovers to 10.8% by Q2 2027; downside fixed-charge coverage reaches a low of 1.12x.",
  },
};
