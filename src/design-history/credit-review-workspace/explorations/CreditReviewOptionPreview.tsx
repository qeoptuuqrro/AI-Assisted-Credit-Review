import type { ReactNode } from "react";
import type { DesignOptionArea } from "../../../features/design-tools/designOptions";
import styles from "./CreditReviewOptionPreview.module.css";

type CreditReviewOptionPreviewProps = {
  optionId: string;
  area: DesignOptionArea;
};

export function CreditReviewOptionPreview({ optionId, area }: CreditReviewOptionPreviewProps) {
  if (area === "case-workspace") return optionId.includes("portfolio-cockpit") ? <PortfolioCockpit /> : <DecisionBrief />;
  if (area === "finding-investigation") return optionId.includes("split-reader") ? <SplitReader /> : <EvidenceDossier />;
  if (area === "reassessment") return optionId.includes("scenario-compare") ? <ScenarioCompare /> : <ChangeRecord />;
  return optionId.includes("decision-room") ? <DecisionRoom /> : <CreditMemo />;
}

function Frame({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <article className={styles.frame}>
      <header className={styles.frameHeader}>
        <span className={styles.mark}>M</span>
        <div><small>{eyebrow}</small><h3>{title}</h3></div>
        <span className={styles.caseState}>Meridian Foods · $18M</span>
      </header>
      {children}
    </article>
  );
}

function PortfolioCockpit() {
  return (
    <Frame eyebrow="Case workspace" title="Portfolio cockpit">
      <div className={styles.cockpitMetrics}><Metric label="Assessment" value="Proceed" detail="with conditions" /><Metric label="Repayment" value="1.41x" detail="0.21x headroom" /><Metric label="Evidence" value="9 / 12" detail="current sources" /><Metric label="Open issues" value="3" detail="need judgment" /></div>
      <div className={styles.cockpitGrid}>
        <section className={styles.previewPanel}><Label title="Risk signals" detail="Cross-case monitoring" /><Bars /><Rows labels={["Customer concentration", "Declining margins", "Increasing leverage"]} /></section>
        <section className={styles.previewPanel}><Label title="Repayment outlook" detail="Actual and forecast" /><MiniChart /><Rows labels={["Base case · 1.41x", "Downside · 1.12x"]} /></section>
      </div>
    </Frame>
  );
}

function DecisionBrief() {
  return (
    <Frame eyebrow="Case workspace" title="Decision brief">
      <section className={`${styles.previewPanel} ${styles.heroPanel}`}><small>Preliminary assessment · Moderate confidence</small><h4>Proceed with conditions</h4><p>Repayment is supportable, with three issues requiring analyst judgment.</p><button type="button">Review next finding</button></section>
      <div className={styles.briefFacts}><Metric label="Request" value="$18M" detail="3-year revolver" /><Metric label="Evidence" value="9 of 12" detail="current" /><Metric label="Relationship" value="8 years" detail="$6.8M balances" /></div>
      <section className={styles.previewPanel}><Label title="Needs your attention" detail="3 findings" /><Rows labels={["Customer concentration · Material", "Declining margins · Material", "Increasing leverage · Moderate"]} /></section>
    </Frame>
  );
}

function SplitReader() {
  return (
    <Frame eyebrow="Finding investigation" title="Split source reader">
      <div className={styles.splitLayout}>
        <section className={styles.previewPanel}><Label title="Customer concentration" detail="Material risk" /><h4>Two customers represent 61% of revenue.</h4><p>The original analysis assumes Customer A expires within twelve months.</p><Rows labels={["36% · Customer A", "25% · Customer B", "Contract date needs verification"]} /></section>
        <section className={`${styles.previewPanel} ${styles.documentPanel}`}><small>Customer A supply agreement</small><div className={styles.paper}><b>Section 2.1 · Term</b><i /><i /><i /><mark>The initial term ends March 31, 2027.</mark><i /><i /></div></section>
      </div>
    </Frame>
  );
}

function EvidenceDossier() {
  return (
    <Frame eyebrow="Finding investigation" title="Evidence dossier">
      <nav className={styles.sectionNav}><span>Assessment</span><span>Evidence</span><span>Judgment</span></nav>
      <section className={`${styles.previewPanel} ${styles.dossier}`}><small>Current assessment · Material risk</small><h4>How exposed is repayment capacity to the two largest customers?</h4><p>Two customers represent 61% of revenue; contract duration is the material uncertainty.</p><Label title="Basis for assessment" detail="Verified and inferred" /><Rows labels={["Revenue concentration · 61% verified", "Contract expiration · March 2027 assumed", "Downside replacement period · Six months"]} /><Label title="Evidence used" detail="4 cited sources" /><div className={styles.documentRows}><span>Customer concentration report</span><span>Customer A supply agreement</span></div></section>
      <footer className={styles.judgmentBar}><span><b>Analyst judgment required</b><small>Confirm or challenge the assumption.</small></span><button type="button">Record judgment</button></footer>
    </Frame>
  );
}

function ScenarioCompare() {
  return (
    <Frame eyebrow="Reassessment" title="Scenario compare">
      <div className={styles.compareGrid}><section className={styles.previewPanel}><small>Before</small><h4>Material risk</h4><p>Customer A may expire within twelve months.</p><Rows labels={["Contract through Mar 2027", "Top two customers · 61%", "Monitoring required"]} /></section><section className={`${styles.previewPanel} ${styles.updatedPanel}`}><small>Updated</small><h4>Moderate risk</h4><p>Executed renewal reduces near-term loss risk.</p><Rows labels={["Contract through Mar 2030", "Top two customers · 61%", "Monitoring retained"]} /></section></div>
    </Frame>
  );
}

function ChangeRecord() {
  return (
    <Frame eyebrow="Reassessment" title="Change record">
      <section className={`${styles.previewPanel} ${styles.changeRecord}`}><div className={styles.ratingChange}><span><small>Original</small><b>Material</b></span><span className={styles.arrow}>→</span><span><small>Revised</small><b>Moderate</b></span></div><div className={styles.recordColumns}><div><small>New evidence</small><b>Executed renewal</b><p>Term extended through March 2030.</p></div><div><small>Changed</small><b>Near-term expiration risk</b><p>Revenue loss is no longer assumed in the next year.</p></div><div><small>Unchanged</small><b>Structural concentration</b><p>Top two customers remain 61% of revenue.</p></div></div><footer>Alex Kim · Evidence linked and reassessment accepted</footer></section>
    </Frame>
  );
}

function DecisionRoom() {
  return (
    <Frame eyebrow="Recommendation & decision" title="Decision room">
      <div className={styles.decisionRoom}><section className={styles.previewPanel}><Label title="Analyst recommendation" detail="Draft" /><h4>Proceed with conditions</h4><Rows labels={["$18M revolving facility", "Maximum leverage · 4.25x", "Minimum coverage · 1.20x"]} /><div className={styles.comment}><b>Senior credit</b><p>Confirm the equipment obligation classification.</p></div></section><aside className={styles.previewPanel}><Label title="Case record" detail="Ready" /><Rows labels={["12 sources reviewed", "3 findings completed", "1 human reassessment"]} /><button type="button">Request decision</button></aside></div>
    </Frame>
  );
}

function CreditMemo() {
  return (
    <Frame eyebrow="Recommendation & decision" title="Credit memo handoff">
      <div className={styles.memoGrid}><section className={`${styles.previewPanel} ${styles.memo}`}><small>Analyst recommendation</small><h4>Proceed with conditions</h4><p>Meridian can support the requested line under the base case. The renewal reduces near-term concentration risk while structural exposure remains.</p><Label title="Facility" detail="$18M · 3 years" /><Label title="Conditions" detail="Quarterly concentration reporting · 4.25x leverage · 1.20x coverage" /><button type="button">Submit for senior review</button></section><aside className={styles.previewPanel}><small>Decision record</small><dl><div><dt>Prepared by</dt><dd>Alex Kim</dd></div><div><dt>Sources</dt><dd>12 reviewed</dd></div><div><dt>Findings</dt><dd>3 complete</dd></div><div><dt>Changes</dt><dd>1 reassessment</dd></div></dl></aside></div>
    </Frame>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <section className={styles.metric}><small>{label}</small><strong>{value}</strong><span>{detail}</span></section>;
}

function Label({ title, detail }: { title: string; detail: string }) {
  return <header className={styles.label}><b>{title}</b><small>{detail}</small></header>;
}

function Rows({ labels }: { labels: string[] }) {
  return <div className={styles.rows}>{labels.map((label) => <div key={label}><span>{label}</span><b>›</b></div>)}</div>;
}

function Bars() {
  return <div className={styles.bars}><i /><i /><i /><i /><i /></div>;
}

function MiniChart() {
  return <svg className={styles.chart} viewBox="0 0 420 100" aria-hidden="true"><path d="M0 20 C55 18, 70 34, 110 38 S175 66, 220 58 S300 82, 420 62" /><line x1="0" y1="78" x2="420" y2="78" /></svg>;
}
