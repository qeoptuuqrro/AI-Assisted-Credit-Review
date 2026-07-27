import { useEffect, useState } from "react";
import { Button } from "../../shared/ui/Button/Button";
import { CompanyLogo } from "../../shared/ui/CompanyLogo/CompanyLogo";
import { DocumentRow } from "../../shared/ui/DocumentRow/DocumentRow";
import { DocumentViewer } from "../../shared/ui/DocumentViewer/DocumentViewer";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection } from "../../shared/ui/Drawer/Drawer";
import { Icon } from "../../shared/ui/Icon/Icon";
import { IconTile } from "../../shared/ui/IconTile/IconTile";
import { StatusPill, type StatusPillTone } from "../../shared/ui/StatusPill/StatusPill";
import type { CreditReview, ReviewSource } from "./reviewData";
import { companyLogoDomains } from "./companyLogos";
import { getCreditFindingIcon, getCreditSourceIcon } from "./creditReviewPresentation";
import { currentJudgmentForFinding, isFindingAddressed, type MeridianReviewState } from "./workflow/creditReviewState";
import { findings as meridianFindingDefinitions } from "./workspace/meridianData";
import { getFindingDisplayRisk, getFindingScanSummary, getFindingStatusPresentation } from "./workspace/findingJudgmentPresentation";
import styles from "./CreditReviewDrawer.module.css";

type CreditReviewDrawerProps = {
  review: CreditReview;
  status: { label: string; tone: StatusPillTone };
  open?: boolean;
  layout?: "overlay" | "responsive";
  presentation?: "legacy" | "outcome";
  meridianState?: MeridianReviewState;
  onClose: () => void;
  onExited?: () => void;
  onOpenFinding?: (findingId: string) => void;
  onOpenFullReview?: () => void;
};

const recommendationByState: Record<CreditReview["aiReviewState"], string> = {
  "needs-judgment": "Proceed with conditions",
  "needs-verification": "Verify evidence before proceeding",
  "analysis-ready": "Analysis is ready for review",
  "analysis-updated": "Review the updated analysis",
  "review-complete": "Ready for decision",
};

const summaryByState: Record<CreditReview["aiReviewState"], string> = {
  "needs-judgment": "The initial assessment identified findings that require your interpretation before the review can move forward.",
  "needs-verification": "Part of the supporting evidence could not be reconciled and should be verified.",
  "analysis-ready": "The available evidence has been reviewed with nothing blocking analyst review.",
  "analysis-updated": "The analysis changed after new context or evidence was added.",
  "review-complete": "All findings have been addressed and the review can move to decision.",
};

const primaryActionByState: Record<CreditReview["aiReviewState"], string> = {
  "needs-judgment": "Review findings",
  "needs-verification": "Verify information",
  "analysis-ready": "Review analysis",
  "analysis-updated": "Review changes",
  "review-complete": "View recommendation",
};

type DrawerFinding = {
  id: string;
  title: string;
  description: string;
  risk: "Material" | "Moderate" | "Low";
  status: string;
  tone: StatusPillTone;
  change?: { from: string; to: string };
  sourceId?: string;
  addressed?: boolean;
};

const meridianFindings: DrawerFinding[] = [
  { id: "customer-concentration", title: "Customer concentration", description: "Two customers represent 61% of revenue.", risk: "Material", status: "Needs judgment", tone: "warning" },
  { id: "declining-margins", title: "Declining margins", description: "EBITDA margin declined from 14.2% to 9.1%.", risk: "Material", status: "Needs judgment", tone: "warning" },
  { id: "increasing-leverage", title: "Increasing leverage", description: "One $2.1M obligation still needs classification.", risk: "Moderate", status: "Needs verification", tone: "danger" },
];

const northstarRequirement: DrawerFinding = {
  id: "northstar-operating-forecast",
  title: "2027 operating forecast",
  description: "The latest approved forecast ends in December 2026, so downside repayment capacity cannot be completed.",
  risk: "Moderate",
  status: "Missing",
  tone: "danger",
};

const stateFinding: Record<CreditReview["aiReviewState"], DrawerFinding> = {
  "needs-judgment": { id: "credit-structure", title: "Credit structure", description: "An important finding requires analyst interpretation.", risk: "Moderate", status: "Needs judgment", tone: "warning" },
  "needs-verification": { id: "financial-evidence", title: "Financial evidence", description: "One document could not be reconciled with the reported figures.", risk: "Material", status: "Needs verification", tone: "danger", sourceId: "q2-financials" },
  "analysis-ready": { id: "capacity-analysis", title: "Capacity analysis", description: "Available evidence supports analyst review with no blockers.", risk: "Low", status: "Analysis ready", tone: "neutral" },
  "analysis-updated": { id: "revenue-variance", title: "Revenue variance", description: "New evidence changed part of the assessment.", risk: "Low", status: "Updated", tone: "info", change: { from: "Moderate", to: "Low" } },
  "review-complete": { id: "findings-resolution", title: "Findings resolution", description: "Every finding has been addressed by the analyst.", risk: "Low", status: "Complete", tone: "success" },
};

const reviewSources: ReviewSource[] = [
  { id: "q2-financials", name: "Q2 2026 Financials", meta: "PDF · Reviewed Jun 30, 2026", summary: "Current financial statements covering revenue, margins, and leverage." },
  { id: "revenue-forecast", name: "Revenue forecast", meta: "PDF · Reviewed Jun 28, 2026", summary: "Management forecast used to reconcile the requested facility and repayment capacity." },
  { id: "credit-agreement", name: "Credit agreement", meta: "PDF · Reviewed Jun 24, 2026", summary: "Facility terms, covenants, and reporting requirements for this request." },
  { id: "concentration-report", name: "Customer concentration report", meta: "XLSX · Reviewed Jun 22, 2026", summary: "Customer-level revenue concentration and renewal exposure." },
  { id: "ar-aging", name: "A/R aging schedule", meta: "XLSX · Reviewed Jun 20, 2026", summary: "Receivables aging and collection profile used in working-capital analysis." },
  { id: "bank-statements", name: "Operating account statements", meta: "PDF · Reviewed Jun 18, 2026", summary: "Recent operating account activity and liquidity evidence." },
  { id: "debt-schedule", name: "Debt schedule", meta: "XLSX · Reviewed Jun 17, 2026", summary: "Outstanding debt, maturities, and interest obligations." },
  { id: "management-presentation", name: "Management presentation", meta: "PDF · Reviewed Jun 15, 2026", summary: "Management context for performance, strategy, and near-term priorities." },
  { id: "covenant-package", name: "Covenant compliance package", meta: "PDF · Reviewed Jun 12, 2026", summary: "Latest covenant calculations and supporting schedules." },
  { id: "q1-financials", name: "Q1 2026 Financials", meta: "PDF · Reviewed Apr 2, 2026", summary: "Prior-quarter financials used for trend comparison." },
  { id: "board-plan", name: "Board-approved operating plan", meta: "PDF · Reviewed Mar 28, 2026", summary: "Approved annual plan and planned investment assumptions." },
  { id: "borrowing-base", name: "Borrowing base certificate", meta: "PDF · Reviewed Mar 25, 2026", summary: "Collateral and availability support for the revolving line." },
];

function splitRequest(request: string) {
  const [amount, ...description] = request.split(" ");
  return { amount, description: description.join(" ") };
}

function drawerFindingsForMeridian(state: MeridianReviewState): DrawerFinding[] {
  return meridianFindingDefinitions.map((finding) => {
    const workflowState = state.findingStates[finding.id];
    const judgment = currentJudgmentForFinding(state.judgments, finding.id);
    const reassessed = state.reassessments.some((record) => record.findingId === finding.id && record.status === "current");
    const statusPresentation = getFindingStatusPresentation(workflowState, judgment);

    return {
      id: finding.id,
      title: finding.title,
      description: getFindingScanSummary(finding, reassessed),
      risk: getFindingDisplayRisk(finding, reassessed, judgment),
      status: statusPresentation.label,
      tone: statusPresentation.tone,
      sourceId: finding.sourceIds[0],
      addressed: isFindingAddressed(workflowState),
    };
  });
}

export function CreditReviewDrawer({
  review,
  status,
  open = true,
  layout = "overlay",
  presentation = "outcome",
  meridianState,
  onClose,
  onExited,
  onOpenFinding,
  onOpenFullReview,
}: CreditReviewDrawerProps) {
  const [showAllSources, setShowAllSources] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const titleId = `credit-review-${review.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const request = splitRequest(review.request);
  const findings: DrawerFinding[] = review.company === "Meridian Foods"
    ? meridianState ? drawerFindingsForMeridian(meridianState) : meridianFindings
    : review.company === "Northstar Health"
      ? [northstarRequirement]
      : review.details?.findings ?? [stateFinding[review.aiReviewState]];
  const sources = review.details?.sources ?? reviewSources;
  const verificationCount = review.details?.findings.filter((finding) => finding.tone === "danger").length ?? 1;
  const sourceNote = review.aiReviewState === "needs-verification"
    ? `${verificationCount} ${verificationCount === 1 ? "source needs" : "sources need"} verification`
    : "Core financial documents are current";
  const visibleSources = showAllSources ? sources : sources.slice(0, 3);
  const selectedSource = sources.find((source) => source.id === selectedSourceId);
  const openFindingCount = findings.filter((finding) => !finding.addressed).length;
  const primaryActionLabel = review.company === "Meridian Foods"
    ? openFindingCount > 0 ? "Review findings" : "View recommendation"
    : primaryActionByState[review.aiReviewState];
  const northstarNeedsEvidence = review.company === "Northstar Health" && review.aiReviewState === "needs-verification";
  const reviewBriefTitle = review.company === "Northstar Health"
    ? northstarNeedsEvidence ? "Evidence required" : "Analysis complete"
    : review.company === "Meridian Foods"
      ? openFindingCount > 0 ? "Analyst review required" : "Ready for decision"
      : review.aiReviewState === "needs-verification"
        ? "Evidence verification required"
        : review.aiReviewState === "needs-judgment"
          ? "Analyst judgment required"
          : review.aiReviewState === "analysis-ready"
            ? "Analysis ready for review"
            : review.aiReviewState === "analysis-updated"
              ? "Updated analysis ready"
              : "Ready for decision";
  const outcomeSummary = review.company === "Northstar Health"
    ? northstarNeedsEvidence
      ? "The approved forecast ends in December 2026. Downside repayment capacity cannot be completed until the 2027 operating forecast is verified."
      : "The verified 2027 forecast supports 1.29x downside fixed-charge coverage against a 1.20x policy floor."
    : review.details?.assessment ?? summaryByState[review.aiReviewState];
  const nextStep = review.company === "Northstar Health"
    ? northstarNeedsEvidence
      ? "Request or upload the 2027 forecast, then verify it to resume analysis."
      : "Confirm the updated coverage result, then prepare the recommendation."
    : openFindingCount > 0
      ? "Review the flagged evidence and record analyst judgment before moving to decision."
      : "Open the recommendation and prepare it for senior credit review.";
  const reviewBriefTone = review.aiReviewState === "needs-verification"
    ? "danger"
    : review.aiReviewState === "needs-judgment"
      ? "warning"
      : review.aiReviewState === "review-complete"
        ? "success"
        : "info";

  useEffect(() => {
    setShowAllSources(false);
    setSelectedSourceId(null);
  }, [review.company]);

  return (
    <>
      <Drawer open={open} layout={layout} onClose={onClose} onExited={onExited} labelledBy={titleId}>
        <DrawerHeader onClose={onClose}>
          {presentation === "legacy" ? (
            <>
              <span className={styles.eyebrow}>Credit review</span>
              <h2 id={titleId}>{review.company}</h2>
              <p>{review.facilityType}</p>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </>
          ) : (
            <div className={styles.outcomeHeader}>
              <span className={styles.eyebrow}>Credit review</span>
              <div className={styles.companyHeader}>
                <CompanyLogo domain={companyLogoDomains[review.company]} name={review.company} size="md" />
                <span>
                  <h2 id={titleId}>{review.company}</h2>
                  <p>{review.facilityType}</p>
                </span>
              </div>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </div>
          )}
        </DrawerHeader>

        <DrawerBody>
          <DrawerSection className={styles.requestSection} aria-label="Request summary">
            <strong className={styles.amount}>{request.amount}</strong>
            <span className={styles.requestName}>{request.description}</span>
            <dl className={styles.requestMeta}>
              <div><dt>Due</dt><dd>{review.due}</dd></div>
              <div><dt>Owner</dt><dd>{review.owner}</dd></div>
            </dl>
          </DrawerSection>

          {presentation === "legacy" ? (
            <DrawerSection className={styles.aiSection} aria-labelledby={`${titleId}-ai-review`}>
              <h3 id={`${titleId}-ai-review`}>Initial assessment</h3>
              <strong className={styles.recommendation}>{review.company === "Northstar Health" ? "2027 forecast required" : review.details?.recommendation.title ?? recommendationByState[review.aiReviewState]}</strong>
              <p>{review.company === "Northstar Health" ? "AI paused the downside repayment analysis because a material forecast period is missing." : review.details?.assessment ?? summaryByState[review.aiReviewState]}</p>
              <div className={styles.findingList} aria-label="Key findings">
                {findings.map((finding) => {
                  const findingSource = finding.sourceId ? sources.find((source) => source.id === finding.sourceId) : undefined;
                  const findingIsInteractive = Boolean(finding.id && onOpenFinding);
                  return (
                    <article
                      className={`${styles.findingBlock} ${findingIsInteractive ? styles.findingBlockInteractive : ""}`}
                      key={finding.title}
                      role={findingIsInteractive ? "button" : undefined}
                      tabIndex={findingIsInteractive ? 0 : undefined}
                      aria-label={findingIsInteractive ? `Open ${finding.title} finding` : undefined}
                      onClick={() => finding.id && onOpenFinding?.(finding.id)}
                      onKeyDown={(event) => {
                        if (!finding.id || !onOpenFinding || (event.key !== "Enter" && event.key !== " ")) return;
                        event.preventDefault();
                        onOpenFinding(finding.id);
                      }}
                    >
                      <div className={styles.findingTopline}>
                        <strong>{finding.title}</strong>
                        <span className={styles.findingAffordance}>
                          <StatusPill tone={finding.tone}>{finding.status}</StatusPill>
                          {findingIsInteractive && <Icon name="chevronRight" size="sm" />}
                        </span>
                      </div>
                      <p>{finding.description}</p>
                      {finding.change && (
                        <div className={styles.findingChange} aria-label={`Assessment changed from ${finding.change.from} to ${finding.change.to}`}>
                          <span>{finding.change.from}</span><Icon name="arrowRight" size="xs" /><strong>{finding.change.to}</strong>
                        </div>
                      )}
                      {findingSource && (
                        <div className={styles.affectedSource}>
                          <span>Affected source</span>
                          <DocumentRow name={findingSource.name} meta={findingSource.meta} icon={getCreditSourceIcon(findingSource)} onOpen={() => setSelectedSourceId(findingSource.id)} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </DrawerSection>
          ) : (
            <DrawerSection className={styles.outcomeSection} aria-labelledby={`${titleId}-review-focus`}>
              <div className={styles.reviewBrief} data-tone={reviewBriefTone}>
                <div className={styles.reviewBriefHeader}>
                  <IconTile className={styles.reviewBriefIcon} tone={reviewBriefTone} shape="circle">
                    <Icon name="spark" size="sm" />
                  </IconTile>
                  <span className={styles.reviewBriefHeading}>
                    <span>AI review brief</span>
                    <h3 id={`${titleId}-review-focus`}>{reviewBriefTitle}</h3>
                  </span>
                </div>
                <p>{outcomeSummary}</p>
                <div className={styles.reviewBriefNextStep}>
                  <Icon name={reviewBriefTone === "success" ? "checkCircle" : "arrowRight"} size="sm" />
                  <span><small>Next step</small><strong>{nextStep}</strong></span>
                </div>
              </div>
              {review.company !== "Northstar Health" && (
                <div className={styles.outcomeLedger} aria-label="Finding review status">
                  {findings.map((finding) => {
                    const findingIsInteractive = Boolean(onOpenFinding);
                    const content = (
                      <>
                        <IconTile size="sm" tone={finding.addressed ? "success" : finding.tone === "danger" ? "danger" : finding.tone === "warning" ? "warning" : "neutral"}>
                          <Icon name={getCreditFindingIcon(finding)} size="sm" />
                        </IconTile>
                        <span className={styles.outcomeFindingCopy}>
                          <strong>{finding.title}</strong>
                          <small>{finding.description}</small>
                          <span className={styles.outcomeFindingMeta}>
                            <span>{finding.risk} risk</span>
                            <StatusPill tone={finding.tone}>{finding.status}</StatusPill>
                          </span>
                        </span>
                        {findingIsInteractive && <Icon className={styles.outcomeChevron} name="chevronRight" size="sm" />}
                      </>
                    );
                    return findingIsInteractive ? (
                      <button type="button" className={styles.outcomeFindingRow} key={finding.id} aria-label={`Open ${finding.title} finding`} onClick={() => onOpenFinding?.(finding.id)}>{content}</button>
                    ) : (
                      <div className={styles.outcomeFindingRow} key={finding.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </DrawerSection>
          )}

          <DrawerSection className={styles.sourceSection} aria-labelledby={`${titleId}-sources`}>
            <h3 id={`${titleId}-sources`}>Sources</h3>
            <div className={styles.sourceSummary}>
              <strong>{sources.length} sources reviewed</strong>
              <span>{sourceNote}</span>
            </div>
            <div className={styles.sourceList} role="list" aria-label="Reviewed source documents">
              {visibleSources.map((source) => (
                <div role="listitem" key={source.id}>
                  <DocumentRow name={source.name} meta={source.meta} icon={getCreditSourceIcon(source)} onOpen={() => setSelectedSourceId(source.id)} />
                </div>
              ))}
            </div>
            <button type="button" className={styles.sourceDisclosure} aria-expanded={showAllSources} onClick={() => setShowAllSources((current) => !current)}>
              {showAllSources ? "Show key sources" : `View all ${sources.length}`}
              <Icon className={showAllSources ? styles.sourceDisclosureExpanded : ""} name="chevronDown" size="sm" />
            </button>
          </DrawerSection>
        </DrawerBody>
        {onOpenFullReview && (
          <DrawerFooter className={styles.footer}>
            <Button variant="primary" onClick={onOpenFullReview}>{primaryActionLabel}</Button>
          </DrawerFooter>
        )}
      </Drawer>

      <DocumentViewer
        open={Boolean(selectedSource)}
        onClose={() => setSelectedSourceId(null)}
        title={selectedSource?.name ?? "Source document"}
        meta={selectedSource?.meta ?? "Reviewed source"}
      >
        <p>{selectedSource?.summary}</p>
        <p>This source was reviewed as part of the {review.company} credit analysis.</p>
      </DocumentViewer>
    </>
  );
}
