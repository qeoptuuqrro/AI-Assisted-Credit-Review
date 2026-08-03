import type { CaseStatus } from "../../shared/ui/CaseStatusPill/CaseStatusPill";
import { companyLogoDomains } from "./companyLogos";
import type { CreditReview, ReviewFacilityType, ReviewStatus } from "./reviewData";

export const ALL_REVIEWS_TOTAL = 68;
export const INITIAL_ALL_REVIEWS_COUNT = 14;
export const ALL_REVIEWS_BATCH_SIZE = 10;

export const queueReviewOwners = [
  "Alex Kim",
  "Jordan Lee",
  "Maya Chen",
  "Sam Patel",
  "Nina Ross",
  "Owen Grant",
  "Eli Ward",
] as const;

export type QueueReviewOwner = (typeof queueReviewOwners)[number];
export type QueueReviewDueGroup = CreditReview["dueGroup"] | "later";

type QueueReviewFields = {
  id: string;
  company: string;
  logoDomain?: string;
  request: string;
  facilityType: ReviewFacilityType;
  caseStatus: CaseStatus;
  owner: QueueReviewOwner;
  due: string;
  dueGroup: QueueReviewDueGroup;
  status: ReviewStatus;
};

export type QueueReviewItem =
  | (QueueReviewFields & { kind: "case"; review: CreditReview })
  | (QueueReviewFields & { kind: "placeholder" });

const placeholderOwners = queueReviewOwners.filter((owner) => owner !== "Alex Kim");

const requestTemplates: ReadonlyArray<{ request: string; facilityType: ReviewFacilityType }> = [
  { request: "$9M revolving line", facilityType: "Revolving line" },
  { request: "$14M term loan", facilityType: "Term loan" },
  { request: "$7.5M asset-based line", facilityType: "Revolving line" },
  { request: "$18M acquisition term loan", facilityType: "Term loan" },
  { request: "$6M working-capital line", facilityType: "Revolving line" },
  { request: "$11M equipment loan", facilityType: "Term loan" },
  { request: "$8.5M receivables line", facilityType: "Revolving line" },
  { request: "$16M expansion term loan", facilityType: "Term loan" },
  { request: "$5M seasonal line", facilityType: "Revolving line" },
  { request: "$20M term loan", facilityType: "Term loan" },
  { request: "$12M revolving line", facilityType: "Revolving line" },
  { request: "$10M equipment term loan", facilityType: "Term loan" },
];

const placeholderSeeds = [
  ["Bluewater Hospitality", "airbnb.com"],
  ["Granite Peak Materials", "stripe.com"],
  ["Everfield Pharmacy", "notion.so"],
  ["Clearbrook Foods", "figma.com"],
  ["Horizon Fleet", "slack.com"],
  ["Willow Creek Dental", "dropbox.com"],
  ["Copperline Utilities", "intercom.com"],
  ["Silver Oak Apparel", "zapier.com"],
  ["Riverton Plastics", "asana.com"],
  ["Brookfield Labs", "canva.com"],
  ["Fairview Equipment", "wise.com"],
  ["Ironwood Fabrication", "ramp.com"],
  ["Monarch Supply", "brex.com"],
  ["Beacon Homecare", "plaid.com"],
  ["Cascade Components", "gusto.com"],
  ["Crestline Beverages", "rippling.com"],
  ["Prairie Star Ag", "webflow.com"],
  ["Eastgate Diagnostics", "framer.com"],
  ["Firstlight Solar", "vercel.com"],
  ["Pinecrest Furniture", "github.com"],
  ["Northbridge Software", "gitlab.com"],
  ["Rainier Coffee", "cloudflare.com"],
  ["Broadleaf Paper", "datadog.com"],
  ["Skyline Mobility", "snowflake.com"],
  ["Harborview Hotels", "airtable.com"],
  ["Meadowlane Foods", "calendly.com"],
  ["Summit Ridge Care", "miro.com"],
  ["Redstone Packaging", "typeform.com"],
  ["Greenfield Logistics", "loom.com"],
  ["Whitecap Marine", "grammarly.com"],
  ["Oakwell Services", "duolingo.com"],
  ["Daybreak Energy", "spotify.com"],
  ["Stonefield Mining", "reddit.com"],
  ["Lumina Lighting", "shopify.com"],
  ["Vector Automotive", "squareup.com"],
  ["Goldenfield Dairy", "toasttab.com"],
  ["Seabrook Chemicals", "robinhood.com"],
  ["Parkside Clinics", "coinbase.com"],
  ["Sterling Plastics", "chime.com"],
  ["New Harbor Hotels", "affirm.com"],
  ["Westbridge Data", "klarna.com"],
  ["Highpoint Medical", "flexport.com"],
  ["Riverbend Drinks", "samsara.com"],
  ["Fairhaven Textiles", "geotab.com"],
  ["Clearpath Security", "upwork.com"],
  ["Northwind Networks", "fiverr.com"],
  ["Juniper Robotics", "monday.com"],
  ["Solace Health", "clickup.com"],
  ["Ember Foods", "docusign.com"],
  ["Cobalt Freight", "box.com"],
  ["Vale Systems", "hubspot.com"],
  ["Aurora Dental", "zendesk.com"],
  ["Birchwood Retail", "zoom.us"],
  ["Alpine Pharma", "twilio.com"],
] as const satisfies ReadonlyArray<readonly [company: string, logoDomain: string]>;

function workflowForPlaceholder(index: number): Pick<QueueReviewFields, "caseStatus" | "status"> {
  if (index < 15) {
    const caseStatus: CaseStatus = index < 6
      ? "needs-verification"
      : index < 12
        ? "needs-judgment"
        : "revision-requested";
    return { caseStatus, status: "needs-attention" };
  }

  if (index < 40) {
    return {
      caseStatus: index - 15 < 17 ? "analyst-review" : "ready-to-recommend",
      status: "in-review",
    };
  }

  if (index < 48) return { caseStatus: "awaiting-decision", status: "ready-for-decision" };
  return { caseStatus: index - 48 < 4 ? "approved" : "declined", status: "completed" };
}

function dueForPlaceholder(index: number, status: ReviewStatus): Pick<QueueReviewFields, "due" | "dueGroup"> {
  if (status === "completed") {
    return { due: ["Jul 18", "Jul 21", "Jul 22", "Jul 23", "Jul 24", "Jul 26"][index - 48], dueGroup: "later" };
  }

  return {
    due: `Aug ${4 + (index % 23)}`,
    dueGroup: index < 5 ? "this-week" : "later",
  };
}

export const placeholderQueueReviews: QueueReviewItem[] = placeholderSeeds.map(([company, logoDomain], index) => {
  const workflow = workflowForPlaceholder(index);
  const request = requestTemplates[index % requestTemplates.length];
  return {
    kind: "placeholder",
    id: `queue-placeholder-${index + 1}`,
    company,
    logoDomain,
    request: request.request,
    facilityType: request.facilityType,
    owner: placeholderOwners[index % placeholderOwners.length],
    ...dueForPlaceholder(index, workflow.status),
    ...workflow,
  };
});

export function buildAllReviewQueue(caseReviews: CreditReview[]): QueueReviewItem[] {
  const caseQueueReviews: QueueReviewItem[] = caseReviews.map((review) => ({
    kind: "case",
    id: review.slug,
    company: review.company,
    logoDomain: companyLogoDomains[review.company],
    request: review.request,
    facilityType: review.facilityType,
    caseStatus: review.caseStatus,
    owner: review.owner,
    due: review.due,
    dueGroup: review.dueGroup,
    status: review.status,
    review,
  }));

  return [...caseQueueReviews, ...placeholderQueueReviews];
}
