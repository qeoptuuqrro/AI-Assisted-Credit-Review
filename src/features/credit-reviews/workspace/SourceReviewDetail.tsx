import { useState, type CSSProperties } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { KeyValueGrid } from "../../../shared/ui/KeyValueGrid/KeyValueGrid";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { findings, sources, type FindingId, type SourceRecord, type SourceReviewState } from "./meridianData";
import { getSourceExtractionFields, getSourceReviewPresentation, relatedSourceIds } from "./sourceReviewData";
import { getCreditSourceIcon } from "../creditReviewPresentation";
import { companyLogoDomains } from "../companyLogos";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import styles from "./SourcesTab.module.css";

type SourceReviewDetailProps = {
  source: SourceRecord;
  reviewState: SourceReviewState;
  renewalLinked: boolean;
  sourceIndex: number;
  sourceCount: number;
  unresolvedCount: number;
  contextFindingId?: FindingId | null;
  resumeEvidenceStage?: "evidence" | "review" | null;
  onBrowseSources: () => void;
  onSelectSource: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  learningMode?: boolean;
};

export function SourceReviewDetail({ source, reviewState, renewalLinked, sourceIndex, sourceCount, unresolvedCount, contextFindingId = null, resumeEvidenceStage = null, onBrowseSources, onSelectSource, onPrevious, onNext, learningMode = false }: SourceReviewDetailProps) {
  const learn = (topicId: "source-verification" | "source-provenance") => getLearningTargetProps(learningMode, topicId);
  const presentation = getSourceReviewPresentation(source, reviewState, renewalLinked);
  const fields = getSourceExtractionFields(source);
  const relatedSourceId = relatedSourceIds[source.id];
  const relatedSource = relatedSourceId ? sources.find((item) => item.id === relatedSourceId) : undefined;
  const linkedRenewal = source.id === "customer-a-renewal" && renewalLinked;
  const relevantFindingIds = linkedRenewal ? ["customer-concentration" as const, ...source.usedIn] : source.usedIn;
  const relevantFindings = [...new Set(relevantFindingIds)].map((id) => findings.find((finding) => finding.id === id)).filter(Boolean);
  const complete = reviewState === "verified" || linkedRenewal;
  const reviewedLabel = complete ? "Just now" : source.reviewed;
  const previousSource = sources[(sourceIndex - 1 + sourceCount) % sourceCount];
  const nextSource = sources[(sourceIndex + 1) % sourceCount];
  const reviewQueueLabel = unresolvedCount === 0 ? "All sources reviewed" : `${unresolvedCount} require review`;
  const contextFinding = contextFindingId ? findings.find((finding) => finding.id === contextFindingId) : undefined;
  const contextualInspection = Boolean(contextFinding);
  const returnsToVerification = Boolean(resumeEvidenceStage);

  return (
    <section className={styles.reviewDetail} aria-labelledby="selected-source-title">
      <header className={styles.reviewIntro}>
        {contextualInspection && <span className={styles.inspectionContext}><Icon name="link" size="xs" />Evidence for {contextFinding?.title}</span>}
        <h1 id="selected-source-title">{contextualInspection ? "Review" : "Verify"} {source.name}</h1>
        <p>{contextualInspection ? returnsToVerification ? "Inspect the highlighted clauses, then return to the verification checklist. Nothing is verified on this page." : "Inspect the highlighted source, then return to the finding. Nothing changes on this page." : "Compare the extracted values with the source document before relying on them in the credit decision."}</p>
      </header>

      {contextualInspection ? (
        <div className={styles.inspectionSource} aria-label={`Inspecting ${source.name}`}>
          <IconTile><Icon name={getCreditSourceIcon(source)} size="sm" /></IconTile>
          <span><strong>{source.name}</strong><small>{source.type} · {source.asOf}</small></span>
          <StatusPill tone="info">Document open</StatusPill>
        </div>
      ) : (
        <div className={styles.sourceNavigator} role="group" aria-label="Source navigation">
          <span className={styles.sourceNavigatorLabel}>Source {sourceIndex + 1} of {sourceCount}</span>
          <button type="button" className={styles.sourceNavButton} aria-label={`Previous source: ${previousSource.name}`} onClick={onPrevious}><Icon name="arrowLeft" size="sm" /></button>
          <button type="button" className={styles.sourcePicker} onClick={onBrowseSources}>
            <IconTile><Icon name={getCreditSourceIcon(source)} size="sm" /></IconTile>
            <span><strong>{source.name}</strong><small>{source.type} · {reviewQueueLabel}</small></span>
            <span className={styles.sourcePickerStatus}><StatusPill tone={presentation.tone}>{presentation.label}</StatusPill></span>
            <Icon name="chevronDown" size="sm" />
          </button>
          <button type="button" className={styles.sourceNavButton} aria-label={`Next source: ${nextSource.name}`} onClick={onNext}><Icon name="arrowRight" size="sm" /></button>
        </div>
      )}

      <section className={styles.verificationCard} aria-labelledby="extracted-values-heading" {...learn("source-verification")}>
        <header><div><h2 id="extracted-values-heading">{contextualInspection ? "What to confirm" : "Extracted values"}</h2><p>{contextualInspection ? "Highlighted clauses in the document at right." : "Values highlighted on the document at right."}</p></div><span>{fields.length} values</span></header>
        <dl className={styles.extractedValues}>
          {fields.map((field) => (
            <div key={field.label} data-attention={field.attention || undefined}>
              <dt>{field.label}<small>{field.context}</small></dt>
              <dd>{field.value}</dd>
              {field.attention && <span title="Requires review"><Icon name="alertCircle" size="xs" /></span>}
            </div>
          ))}
        </dl>
        {source.warning && (
          <div className={styles.reviewWarning}>
            <Icon name="alertCircle" size="sm" />
            <span><strong>Review exception</strong><small>{source.warning}</small></span>
          </div>
        )}
      </section>

      {relatedSource && (
        <section className={styles.relatedSection}>
          <div><h2>{contextualInspection && source.id === "customer-a-renewal" ? "Previous evidence" : source.id === "customer-a-contract" ? "Newer evidence available" : "Compared with"}</h2><p>{contextualInspection && source.id === "customer-a-renewal" ? "Kept for audit history; it does not replace the selected renewal." : "Open the related agreement without leaving this review."}</p></div>
          <button type="button" className={styles.relatedSource} onClick={() => onSelectSource(relatedSource.id)}>
            <IconTile className={styles.relatedSourceIcon} size="sm"><Icon name={getCreditSourceIcon(relatedSource)} size="sm" /></IconTile>
            <span><strong>{relatedSource.name}</strong><small>{relatedSource.asOf} · {relatedSource.id === "customer-a-renewal" ? "Extends term through Mar 2030" : "Original agreement"}</small></span>
            <Icon name="chevronRight" size="sm" />
          </button>
        </section>
      )}

      {source.id === "customer-a-renewal" && contextualInspection && (
        <section className={styles.inspectionImpact} aria-labelledby="inspection-impact-title">
          <header><IconTile tone="info"><Icon name="branch" size="sm" /></IconTile><span><small>What this evidence may change</small><h2 id="inspection-impact-title">Contract term only</h2></span></header>
          <div className={styles.inspectionChangeTrack}>
            <span><small>Current assumption</small><strong>Mar 2027</strong></span>
            <Icon name="arrowRight" size="sm" />
            <span><small>After verification</small><strong>Mar 2030</strong></span>
          </div>
          <footer><span><Icon name="lock" size="xs" />Concentration remains 61%</span><span><Icon name="history" size="xs" />Original agreement stays in history</span></footer>
        </section>
      )}

      {source.id === "customer-a-renewal" && !contextualInspection && (
        <section className={styles.supersessionRecord} aria-labelledby="supersession-title">
          <header><div><span>Evidence supersession</span><h2 id="supersession-title">Replace the expired contract assumption</h2></div><StatusPill tone={linkedRenewal ? "success" : "warning"}>{linkedRenewal ? "Current evidence" : "Analyst action required"}</StatusPill></header>
          <dl>
            <div><dt>Source document</dt><dd>Customer A supply agreement · term ends Mar 31, 2027</dd></div>
            <div><dt>Replacement</dt><dd>Customer A renewal agreement · term ends Mar 31, 2030</dd></div>
            <div><dt>Effective date</dt><dd>Jul 18, 2026</dd></div>
            <div><dt>Affected finding</dt><dd>Customer concentration</dd></div>
            <div><dt>Analyst verification</dt><dd>{linkedRenewal ? "Alex Kim · verified for reassessment" : "Required before reassessment"}</dd></div>
          </dl>
          <p>The original agreement remains in history. Selecting this renewal makes it the current evidence for the contract-duration assumption only.</p>
        </section>
      )}

      <details className={styles.sourceContext} {...learn("source-provenance")}>
        <summary><span><strong>Source details</strong><small>Provenance, citation, and connected findings</small></span><Icon name="chevronDown" size="sm" /></summary>
        <div className={styles.sourceContextBody}>
          <KeyValueGrid columns={2} items={[
            { label: "Reporting date", value: source.asOf },
            { label: "Last reviewed", value: reviewedLabel },
            { label: "Format", value: source.format },
            { label: "Assessment use", value: relevantFindings.length > 0 ? `${relevantFindings.length} ${relevantFindings.length === 1 ? "finding" : "findings"}` : "Not yet linked" },
          ]} />
          <blockquote><span>Document citation</span>{source.excerpt}</blockquote>
          {relevantFindings.length > 0 && (
            <div className={styles.findingLinks}>
              {relevantFindings.map((finding) => finding && <span key={finding.id}><Icon name="link" size="xs" />{finding.title}</span>)}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}

type SourceReviewActionsProps = {
  source: SourceRecord;
  reviewState: SourceReviewState;
  renewalLinked: boolean;
  contextFindingId?: FindingId | null;
  resumeEvidenceStage?: "evidence" | "review" | null;
  onFlag: () => void;
  onComplete: () => void;
  onReturn?: () => void;
  learningMode?: boolean;
};

export function SourceReviewActions({ source, reviewState, renewalLinked, contextFindingId = null, resumeEvidenceStage = null, onFlag, onComplete, onReturn, learningMode = false }: SourceReviewActionsProps) {
  const contextualInspection = Boolean(contextFindingId && onReturn);
  const returnLabel = resumeEvidenceStage ? "Return to evidence" : "Return to finding";
  const linkedRenewal = source.id === "customer-a-renewal" && renewalLinked;
  const complete = reviewState === "verified" || linkedRenewal;
  const blocked = reviewState === "flagged";
  const primaryLabel = complete
    ? linkedRenewal ? "Current evidence" : "Verified"
    : blocked
      ? "Resolve discrepancy first"
      : source.id === "customer-a-renewal"
        ? "Use as current evidence"
        : source.freshness === "Attention"
          ? "Mark exception reviewed"
          : "Confirm source";

  return (
    <footer className={styles.reviewActions} {...getLearningTargetProps(learningMode, "source-review-actions")}>
      <div className={styles.reviewActionsInner}>
        <Button className={styles.secondaryReviewAction} size="lg" variant="quiet" onClick={onFlag}>{blocked ? "Clear discrepancy" : "Flag a discrepancy"}</Button>
        <Button className={styles.primaryReviewAction} size="lg" variant="primary" disabled={!contextualInspection && (complete || blocked)} icon={<Icon name={contextualInspection ? "arrowLeft" : source.id === "customer-a-renewal" ? "link" : "check"} size="xs" />} iconPosition="start" onClick={contextualInspection ? onReturn : onComplete}>{contextualInspection ? returnLabel : primaryLabel}</Button>
      </div>
    </footer>
  );
}

type SourceDocumentPreviewProps = {
  source: SourceRecord;
  sourceIndex: number;
  sourceCount: number;
  onPrevious: () => void;
  onNext: () => void;
  learningMode?: boolean;
};

export function SourceDocumentPreview({ source, sourceIndex, sourceCount, onPrevious, onNext, learningMode = false }: SourceDocumentPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const zoomPercent = Math.round(zoom * 100);
  const canvasStyle = { "--source-document-zoom": zoom } as CSSProperties;

  return (
    <section className={styles.documentStage} aria-label={`${source.name} document preview`} {...getLearningTargetProps(learningMode, "source-document")}>
      <div className={styles.documentScroll}>
        <div className={styles.documentCanvas} style={canvasStyle}>
          <DocumentArtifact source={source} />
        </div>
      </div>
      <div className={styles.documentToolbar}>
        <div className={styles.documentPaging}>
          <button type="button" aria-label="Previous source document" onClick={onPrevious}><Icon name="arrowLeft" size="sm" /></button>
          <span>{sourceIndex + 1} / {sourceCount}</span>
          <button type="button" aria-label="Next source document" onClick={onNext}><Icon name="arrowRight" size="sm" /></button>
        </div>
        <span className={styles.documentFilename}><Icon name="document" size="sm" />{source.name}.{source.format.toLowerCase()}</span>
        <span className={styles.toolbarDivider} aria-hidden="true" />
        <span className={styles.pageCount}>1 page</span>
        <span className={styles.toolbarDivider} aria-hidden="true" />
        <div className={styles.zoomControls}>
          <button type="button" aria-label="Zoom out" disabled={zoom <= 0.9} onClick={() => setZoom((value) => Math.max(0.9, value - 0.1))}>−</button>
          <output aria-live="polite">{zoomPercent}%</output>
          <button type="button" aria-label="Zoom in" disabled={zoom >= 1.1} onClick={() => setZoom((value) => Math.min(1.1, value + 0.1))}>+</button>
          <button type="button" aria-label="Reset zoom" disabled={zoom === 1} onClick={() => setZoom(1)}><Icon name="refresh" size="sm" /></button>
        </div>
      </div>
    </section>
  );
}

function DocumentArtifact({ source }: { source: SourceRecord }) {
  const isContract = source.type === "Contracts";
  const isCredit = source.type === "Credit documents";
  const fields = getSourceExtractionFields(source);
  const documentKind = isContract
    ? source.id === "customer-a-renewal" ? "Executed amendment" : "Commercial agreement"
    : isCredit
      ? "Credit administration"
      : source.type === "Bank data"
        ? "Treasury reporting"
        : source.type === "Projections"
          ? "Management planning"
          : "Quarterly financial reporting";

  return (
    <article className={styles.documentPaper}>
      <header className={styles.documentMasthead}>
        <span className={styles.documentWordmark}><CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="md" /><span><strong>Meridian Foods</strong><small>Operating with care since 1987</small></span></span>
        <span className={styles.documentReference}><small>Private &amp; confidential</small><strong>{source.asOf}</strong></span>
      </header>

      <div className={styles.documentTitle}>
        <span>{documentKind}</span>
        <h2>{isContract ? source.id === "customer-a-renewal" ? "Amendment No. 1" : "Supply Agreement" : source.name}</h2>
        <p>{isContract ? "Customer A and Meridian Foods, Inc." : `Prepared for BCGX Credit · ${source.format} source`}</p>
      </div>

      {isContract ? (
        <div className={styles.contractDocument}>
          <p className={styles.contractLead}>This {source.id === "customer-a-renewal" ? "Amendment No. 1 to the Supply Agreement" : "Supply Agreement"} is entered into by and between <strong>Meridian Foods, Inc.</strong> and <strong>Customer A</strong>. The parties agree to the commercial terms set forth below.</p>
          <section className={styles.contractClause} data-cited="true">
            <span>2. Term and renewal</span>
            <p>The agreement continues through <strong>{source.id === "customer-a-renewal" ? "March 31, 2030" : "March 31, 2027"}</strong>. Minimum annual purchase requirements remain in effect throughout the term.</p>
            <small><Icon name="link" size="xs" /> Cited in the customer concentration assessment</small>
          </section>
          <section className={styles.contractClause}>
            <span>3. Purchase commitments</span>
            <p>Customer A will maintain the purchase volumes and ordering cadence established in Schedule A. Pricing adjustments require written agreement by both parties.</p>
          </section>
          <div className={styles.contractTerms}><span><small>Effective date</small><strong>{source.asOf}</strong></span><span><small>Counterparty</small><strong>Customer A</strong></span><span><small>Governing law</small><strong>New York</strong></span></div>
          <div className={styles.signatureGrid}><span><i>Alexandra Chen</i><small>Customer A · Authorized signer</small></span><span><i>Marcus Reed</i><small>Meridian Foods · Chief Financial Officer</small></span></div>
        </div>
      ) : (
        <>
          <div className={styles.documentMetaGrid}>
            <span><small>Reporting period</small><strong>{source.asOf}</strong></span>
            <span><small>Prepared for</small><strong>BCGX Credit</strong></span>
            <span><small>Basis</small><strong>{isCredit ? "Facility terms" : "Management records"}</strong></span>
          </div>
          <table className={styles.artifactTable}>
            <thead><tr><th>{isCredit ? "Compliance item" : "Reported line item"}</th><th>Reported value</th><th>Supporting reference</th></tr></thead>
            <tbody>{fields.map((field) => <tr className={field.attention ? styles.documentHighlight : ""} key={field.label}><th>{field.label}{field.attention && <small>Review note</small>}</th><td>{field.value}</td><td>{field.context}</td></tr>)}</tbody>
          </table>
          <section className={styles.documentCommentary}>
            <span>{isCredit ? "Certification" : "Reporting note"}</span>
            <p>{source.excerpt}</p>
          </section>
          <div className={styles.documentApproval}>
            <span><small>Prepared by</small><strong>Elena Torres</strong><em>VP, Finance</em></span>
            <span><small>Reviewed by</small><strong>Marcus Reed</strong><em>Chief Financial Officer</em></span>
          </div>
        </>
      )}

      <footer className={styles.documentFootnote}><span>Meridian Foods, Inc. · Internal use only</span><span>1</span></footer>
    </article>
  );
}
