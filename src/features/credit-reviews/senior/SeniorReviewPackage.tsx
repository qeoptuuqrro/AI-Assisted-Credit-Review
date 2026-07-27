import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { Icon, type IconName } from "../../../shared/ui/Icon/Icon";
import { IconTile, type IconTone } from "../../../shared/ui/IconTile/IconTile";
import { KeyValueGrid } from "../../../shared/ui/KeyValueGrid/KeyValueGrid";
import { Notice } from "../../../shared/ui/Notice/Notice";
import { StatusPill, type StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import { LearningModeSurface, getLearningTargetProps, useLearningMode } from "../learning/MeridianLearningMode";
import { seniorDecisionLabel, type AnalystRecommendationRecord, type SeniorDecisionDraft, type SeniorDecisionRecord } from "../workflow/creditReviewState";
import styles from "./SeniorReviewPackage.module.css";

export type SeniorReviewPackageFinding = {
  id: string;
  title: string;
  detail: string;
  status: string;
  risk: string;
  tone?: StatusPillTone;
  icon?: IconName;
};

type SeniorReviewPackageProps = {
  company: string;
  logoDomain?: string;
  request: string;
  facilityType: string;
  recommendation: AnalystRecommendationRecord;
  findings: SeniorReviewPackageFinding[];
  sourcesCount: number;
  decisionMaker?: string;
  existingDecision?: SeniorDecisionRecord;
  draft?: SeniorDecisionDraft;
  learningMode?: boolean;
  onDraftChange?: (draft: SeniorDecisionDraft) => void;
  onExit: () => void;
  onOpenRecord?: (tab: "findings" | "sources" | "activity") => void;
  onSubmit: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void;
};

const options: Array<{ value: SeniorDecisionRecord["decision"]; label: string; description: string; icon: IconName; tone: IconTone }> = [
  { value: "approve", label: "Approve", description: "Accept the analyst recommendation as submitted", icon: "checkCircle", tone: "success" },
  { value: "approve_with_conditions", label: "Approve with conditions", description: "Set the final protections", icon: "shield", tone: "info" },
  { value: "return_to_analyst", label: "Return to analyst", description: "Request a revised recommendation", icon: "arrowLeft", tone: "warning" },
  { value: "decline", label: "Decline", description: "Do not extend the requested facility", icon: "close", tone: "danger" },
];

export function SeniorReviewPackage(props: SeniorReviewPackageProps) {
  return <LearningModeSurface scope="senior-decision" inlineToggle><SeniorReviewPackageContent {...props} /></LearningModeSurface>;
}

function SeniorReviewPackageContent({ company, logoDomain, request, facilityType, recommendation, findings, sourcesCount, decisionMaker = "Morgan Lee", existingDecision, draft, learningMode = false, onDraftChange, onExit, onOpenRecord, onSubmit }: SeniorReviewPackageProps) {
  const learningContext = useLearningMode();
  const learningEnabled = learningMode || learningContext.enabled;
  const initial = draft ?? { decision: "approve_with_conditions" as const, rationale: "", conditions: recommendation.conditions, updatedAt: new Date().toISOString() };
  const [decision, setDecision] = useState<SeniorDecisionRecord["decision"]>(initial.decision);
  const [rationale, setRationale] = useState(initial.rationale);
  const [conditions, setConditions] = useState(initial.conditions);
  const rationaleRequired = decision === "return_to_analyst" || decision === "decline";
  const conditionsRequired = decision === "approve_with_conditions";
  const canSubmit = (!rationaleRequired || Boolean(rationale.trim())) && (!conditionsRequired || conditions.length > 0);
  const updateDraft = (next: Partial<SeniorDecisionDraft>) => onDraftChange?.({ decision, rationale, conditions, ...next, updatedAt: new Date().toISOString() });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmit) onSubmit({ decision, rationale, conditions: conditionsRequired ? conditions : [] });
  }

  return <div className={styles.page}>
    <header className={styles.topbar}>
      <Button variant="quiet" size="sm" iconPosition="start" icon={<Icon name="arrowLeft" size="xs" />} onClick={onExit}>Exit and save</Button>
      <div className={styles.identity}><CompanyLogo domain={logoDomain} name={company} size="sm" /><span><strong>{company}</strong><small>{request} · {facilityType}</small></span></div>
      <StatusPill tone="warning">Decision required</StatusPill>
    </header>
    <main className={styles.frame}>
      <header className={styles.intro} {...getLearningTargetProps(learningEnabled, "senior-decision-story")}><div><span>Senior credit decision</span><h1>Review analyst recommendation</h1><p>{recommendation.author} completed the review and submitted a recommendation. {decisionMaker} owns the final credit decision.</p></div><div className={styles.amount}><span>Requested facility</span><strong>{recommendation.amount}</strong><small>{facilityType}</small></div></header>
      <div className={styles.layout}>
        <section className={styles.brief}>
          <article className={styles.recommendation} {...getLearningTargetProps(learningEnabled, "senior-recommendation")}>
            <header><div><span>Analyst recommendation</span><h2>{recommendation.decision}</h2></div><StatusPill tone="info">Submitted</StatusPill></header>
            <p>{recommendation.rationale}</p>
            <KeyValueGrid columns={4} items={[{ label: "Requested amount", value: recommendation.amount }, { label: "Facility", value: facilityType }, { label: "Prepared by", value: recommendation.author }, { label: "Sources reviewed", value: sourcesCount }]} />
          </article>
          <section className={styles.outcomes} {...getLearningTargetProps(learningEnabled, "senior-findings")}><header><div><span>Decision context</span><h2>Finding outcomes</h2></div><small>{findings.length} findings · analyst-owned</small></header>{findings.length ? <div className={styles.ledger}>{findings.map((finding) => <article key={finding.id}><IconTile size="sm" tone={finding.tone === "danger" ? "danger" : finding.tone === "warning" ? "warning" : "neutral"}><Icon name={finding.icon ?? "alertCircle"} size="sm" /></IconTile><div><strong>{finding.title}</strong><p>{finding.detail}</p></div><span className={styles.outcomeMeta}><span>{finding.risk} risk</span><StatusPill tone={finding.tone ?? "neutral"}>{finding.status}</StatusPill></span></article>)}</div> : <Notice title="No unresolved findings">The submitted recommendation is based on the verified case record.</Notice>}</section>
          <section className={styles.supporting}><div><span>Supporting record</span><strong>{recommendation.conditions.length} protections proposed · {sourcesCount} sources reviewed</strong><p>Open the underlying case only when you need to verify a conclusion or source.</p></div><nav aria-label="Supporting case record">{onOpenRecord && <><Button variant="quiet" size="sm" onClick={() => onOpenRecord("findings")}>Findings</Button><Button variant="quiet" size="sm" onClick={() => onOpenRecord("sources")}>Sources</Button><Button variant="quiet" size="sm" onClick={() => onOpenRecord("activity")}>Activity</Button></>}</nav></section>
          <details className={styles.aiSupport}><summary><IconTile size="sm" tone="neutral"><Icon name="spark" size="sm" /></IconTile><span><strong>Supporting AI assessment</strong><small>Read-only context · not the decision</small></span><Icon name="chevronDown" size="sm" /></summary><div><p>AI summarized the reviewed record and preserved source links. It cannot change the recommendation or submit the final decision.</p></div></details>
        </section>
        <aside className={styles.composer} {...getLearningTargetProps(learningEnabled, "senior-final-action")}>{existingDecision ? <div className={styles.recordedDecision}><header><span>Recorded senior decision</span><h2>{seniorDecisionLabel(existingDecision.decision)}</h2><p>{existingDecision.decisionMaker} recorded this outcome. The decision record is immutable.</p></header><StatusPill tone={existingDecision.decision === "decline" ? "danger" : existingDecision.decision === "return_to_analyst" ? "warning" : "success"}>{seniorDecisionLabel(existingDecision.decision)}</StatusPill><dl><div><dt>Decision maker</dt><dd>{existingDecision.decisionMaker}</dd></div><div><dt>Recorded</dt><dd>{new Date(existingDecision.createdAt).toLocaleString()}</dd></div></dl>{existingDecision.rationale && <p className={styles.recordedRationale}>{existingDecision.rationale}</p>}{existingDecision.conditions.length > 0 && <div className={styles.recordedConditions}>{existingDecision.conditions.map((condition) => <span key={condition}><Icon name="check" size="xs" />{condition}</span>)}</div>}</div> : <form onSubmit={submit}><header><span>Human-owned action</span><h2>Make final decision</h2><p>Select an outcome, confirm protections, and record the decision.</p></header><fieldset className={styles.options}><legend>Decision</legend>{options.map((option) => <label key={option.value} data-selected={decision === option.value}><input type="radio" name={`${company}-senior-decision`} checked={decision === option.value} onChange={() => { setDecision(option.value); updateDraft({ decision: option.value }); }} /><IconTile size="sm" tone={decision === option.value ? option.tone : "neutral"}><Icon name={option.icon} size="sm" /></IconTile><span><strong>{option.label}</strong><small>{option.description}</small></span></label>)}</fieldset>{conditionsRequired && <fieldset className={styles.conditions}><legend>Final approval conditions <small>{conditions.length} selected</small></legend>{recommendation.conditions.map((condition) => <label key={condition}><input type="checkbox" checked={conditions.includes(condition)} onChange={() => { const next = conditions.includes(condition) ? conditions.filter((item) => item !== condition) : [...conditions, condition]; setConditions(next); updateDraft({ conditions: next }); }} /><span>{condition}</span></label>)}</fieldset>}<label className={styles.rationale}><span>Decision note <small>{rationaleRequired ? "Required" : "Optional"}</small></span><textarea value={rationale} onChange={(event) => { setRationale(event.target.value); updateDraft({ rationale: event.target.value }); }} placeholder={decision === "return_to_analyst" ? "Explain what the analyst should revise…" : decision === "decline" ? "Record the reason for declining…" : "Add context for the decision…"} /></label><footer><dl><div><dt>Decision maker</dt><dd>{decisionMaker}</dd></div><div><dt>Record</dt><dd>Immutable on submission</dd></div></dl><Button type="submit" variant="primary" disabled={!canSubmit}>{decision === "approve" ? "Approve facility" : decision === "approve_with_conditions" ? "Approve with conditions" : decision === "return_to_analyst" ? "Return to analyst" : "Decline request"}</Button><small><Icon name="lock" size="xs" /> AI cannot submit this decision.</small></footer></form>}</aside>
      </div>
    </main>
  </div>;
}
