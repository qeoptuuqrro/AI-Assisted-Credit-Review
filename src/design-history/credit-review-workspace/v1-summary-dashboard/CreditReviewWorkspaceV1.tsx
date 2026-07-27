import { useState } from "react";
import styles from "./CreditReviewWorkspaceV1.module.css";

type BaselineView = "overview" | "finding" | "reassessment" | "recommendation";

const views: Array<{ id: BaselineView; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "finding", label: "Finding" },
  { id: "reassessment", label: "Reassessment" },
  { id: "recommendation", label: "Recommendation" },
];

export function CreditReviewWorkspaceV1() {
  const [view, setView] = useState<BaselineView>("overview");

  return (
    <article className={styles.snapshot} aria-label="Credit Review workspace V1 baseline">
      <header className={styles.caseHeader}>
        <span className={styles.mark}>M</span>
        <div>
          <h2>Meridian Foods</h2>
          <p>$18M working-capital line · 3-year revolving facility · Alex Kim · Due today</p>
        </div>
        <span className={styles.status}>Needs judgment · 3 issues</span>
      </header>

      <nav className={styles.viewTabs} aria-label="Baseline views">
        {views.map((item) => (
          <button type="button" key={item.id} aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>
        ))}
      </nav>

      {view === "overview" && <BaselineOverview />}
      {view === "finding" && <BaselineFinding />}
      {view === "reassessment" && <BaselineReassessment />}
      {view === "recommendation" && <BaselineRecommendation />}
    </article>
  );
}

function BaselineOverview() {
  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelTopline}><span>Preliminary assessment</span><span>Updated today, 10:24 AM</span></div>
        <div className={styles.assessmentBody}>
          <span className={styles.neutralTag}>Moderate confidence</span>
          <h3>Proceed with conditions</h3>
          <p>Repayment appears supportable, with customer concentration, declining margins, and increasing leverage requiring analyst judgment.</p>
        </div>
      </section>
      <div className={styles.metrics}>
        <Metric label="Request" value="$18M" detail="3-year revolving line" />
        <Metric label="Evidence readiness" value="9 of 12 current" detail="3 sources need attention" />
        <Metric label="Relationship" value="8 years" detail="$6.8M average collected balances" />
      </div>
      <section className={`${styles.panel} ${styles.findingsPanel}`}>
        <header><div><h3>Needs your attention</h3><p>3 findings still require analyst action.</p></div><span>View all findings</span></header>
        <FindingRow title="Customer concentration" detail="Two customers represent 61% of revenue; the contract assumption needs judgment." risk="Material" state="Needs judgment" />
        <FindingRow title="Declining margins" detail="EBITDA margin declined from 14.2% to 9.1%." risk="Material" state="Needs judgment" />
        <FindingRow title="Increasing leverage" detail="Pro forma debt to EBITDA increases to 3.7x." risk="Moderate" state="Needs verification" />
      </section>
    </div>
  );
}

function BaselineFinding() {
  return (
    <div className={styles.reviewLayout}>
      <ol className={styles.steps}>
        <li className={styles.stepActive}>Assessment<small>Understand the finding</small></li>
        <li>Evidence<small>Verify the source set</small></li>
        <li>Judgment<small>Own the conclusion</small></li>
      </ol>
      <div className={styles.reviewMain}>
        <header className={styles.reviewHeader}><div><span>Review finding</span><h3>Customer concentration</h3><p>How exposed is repayment capacity to the two largest customers?</p></div><span className={styles.materialText}>Material risk</span></header>
        <section className={`${styles.panel} ${styles.reviewCard}`}>
          <span className={styles.eyebrow}>Current assessment</span>
          <h3>Two customers represent 61% of revenue, and the original analysis assumed Customer A's agreement expires within 12 months.</h3>
          <p>A loss or delayed renewal could reduce cash generation while Meridian is carrying higher leverage.</p>
          <div className={styles.rationale}><h4>Why this conclusion</h4><ol><li>Customer A contributes 36% of revenue.</li><li>The contract schedule showed a March 2027 expiration.</li><li>The downside forecast assumed no replacement revenue for six months.</li></ol></div>
          <div className={styles.evidenceGrid}><Evidence name="Customer concentration report" meta="Jun 30, 2026 · Current" /><Evidence name="Customer A supply agreement" meta="Mar 14, 2024 · Attention" /></div>
        </section>
        <footer className={styles.actionBar}><div><strong>Analyst judgment required</strong><span>Confirm the analysis or challenge an assumption.</span></div><div><button type="button">Challenge assumption</button><button type="button" className={styles.primaryButton}>Confirm finding</button></div></footer>
      </div>
    </div>
  );
}

function BaselineReassessment() {
  return (
    <div className={styles.stack}>
      <header className={styles.reviewHeader}><div><span>Review finding</span><h3>Customer concentration</h3><p>Updated after analyst-supplied evidence.</p></div><span className={styles.updatedTag}>Analysis updated</span></header>
      <section className={`${styles.panel} ${styles.transitionPanel}`}>
        <div><small>Before</small><strong>Material</strong></div><span>→</span><div><small>Updated</small><strong>Moderate</strong></div>
        <div><strong>What changed</strong><p>Customer A is contracted through March 2030, reducing immediate revenue-loss risk.</p></div>
        <div><strong>What did not change</strong><p>The top two customers remain 61% of revenue; structural concentration still requires monitoring.</p></div>
      </section>
      <section className={`${styles.panel} ${styles.changeRecord}`}>
        <span className={styles.eyebrow}>Preserved decision record</span>
        <h3>The analyst corrected an outdated contract assumption.</h3>
        <div className={styles.changeColumns}><div><small>Original evidence</small><p>March 2024 supply agreement</p></div><div><small>Human intervention</small><p>Linked executed renewal</p></div><div><small>Result</small><p>Risk reduced; monitoring retained</p></div></div>
      </section>
    </div>
  );
}

function BaselineRecommendation() {
  return (
    <div className={styles.recommendationGrid}>
      <section className={`${styles.panel} ${styles.formPanel}`}>
        <span className={styles.eyebrow}>Analyst recommendation</span>
        <h3>Proceed with conditions</h3>
        <label>Recommended amount<input value="$18,000,000" readOnly /></label>
        <label>Facility term<input value="3 years" readOnly /></label>
        <label>Analyst rationale<textarea value="Meridian can support the requested line under the base case. Concentration remains meaningful, while the renewed contract reduces near-term expiration risk." readOnly /></label>
        <fieldset><legend>Recommended conditions</legend><label><input type="checkbox" checked readOnly /> Quarterly concentration reporting</label><label><input type="checkbox" checked readOnly /> Maximum leverage of 4.25x</label><label><input type="checkbox" checked readOnly /> Minimum fixed-charge coverage of 1.20x</label></fieldset>
        <button type="button" className={styles.primaryButton}>Submit for senior review</button>
      </section>
      <aside className={`${styles.panel} ${styles.handoffPanel}`}><span className={styles.eyebrow}>Preliminary assessment · Read only</span><h3>Proceed with conditions</h3><p>Prepared by Alex Kim for Senior credit.</p><dl><div><dt>Sources</dt><dd>12 reviewed</dd></div><div><dt>Findings</dt><dd>3 complete</dd></div><div><dt>Human changes</dt><dd>1 material reassessment</dd></div></dl></aside>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <section className={styles.metric}><span>{label}</span><strong>{value}</strong><small>{detail}</small></section>;
}

function FindingRow({ title, detail, risk, state }: { title: string; detail: string; risk: string; state: string }) {
  return <div className={styles.findingRow}><i /><span><strong>{title}</strong><small>{detail}</small></span><span><small>{risk} risk</small><em>{state}</em></span></div>;
}

function Evidence({ name, meta }: { name: string; meta: string }) {
  return <div className={styles.evidence}><span>▧</span><div><strong>{name}</strong><small>{meta}</small></div><span>›</span></div>;
}
