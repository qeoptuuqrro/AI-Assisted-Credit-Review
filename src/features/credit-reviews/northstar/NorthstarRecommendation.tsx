import { useState } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection } from "../../../shared/ui/Drawer/Drawer";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { Notice } from "../../../shared/ui/Notice/Notice";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import {
  seniorDecisionLabel,
  type AnalystRecommendationRecord,
  type NorthstarReviewState,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";
import styles from "./NorthstarReviewWorkspace.module.css";
import { getLearningTargetProps, LearningTarget, useLearningMode } from "../learning/MeridianLearningMode";

type NorthstarRecommendationProps = {
  reviewState: NorthstarReviewState;
  onNavigate: (tab: "sources" | "financials" | "activity") => void;
  onSubmit: (record: Omit<AnalystRecommendationRecord, "author" | "createdAt">) => void;
  onSeniorDecision: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void;
  onReopenReturnedRecommendation: () => void;
  onOpenSeniorReview: () => void;
};

const proposedConditions = [
  "Minimum fixed-charge coverage of 1.20x",
  "Quarterly compliance reporting",
  "Annual delivery of the board-approved operating forecast",
];

export function NorthstarRecommendation({ reviewState, onNavigate, onSubmit, onSeniorDecision, onReopenReturnedRecommendation, onOpenSeniorReview }: NorthstarRecommendationProps) {
  const { enabled } = useLearningMode();
  const [recommendationOpen, setRecommendationOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const verified = reviewState.evidenceReviewState === "verified_by_analyst";
  const analysisReviewed = reviewState.analysisReviewState === "completed";
  const recommendation = reviewState.recommendation;
  const seniorDecision = reviewState.seniorDecision;

  return (
    <section id="recommendation-panel" role="tabpanel" className={styles.flatSection} aria-labelledby="northstar-recommendation-title" {...getLearningTargetProps(enabled, "northstar-recommendation")}>
      <SectionHeader
        headingId="northstar-recommendation-title"
        title="Recommendation"
        description="Convert the completed analyst review into an attributable package for senior credit approval. AI can draft it; people submit and decide."
        actions={<StatusPill tone={seniorDecision ? (seniorDecision.decision === "decline" ? "danger" : seniorDecision.decision === "return_to_analyst" ? "warning" : "success") : recommendation ? "warning" : analysisReviewed ? "info" : "neutral"}>{recommendationStatus(reviewState)}</StatusPill>}
      />

      {!seniorDecision && (
        <div className={styles.recommendationChecklist} aria-label="Recommendation prerequisites">
          <header><span>Required handoff</span><strong>{recommendation ? "Submitted to senior credit" : analysisReviewed ? "Ready to prepare" : "Complete analyst review first"}</strong></header>
          <ChecklistRow complete={verified} label="Forecast verified" detail={verified ? "Alex Kim verified the approved 2027 forecast." : "Supply and verify the missing forecast."} />
          <ChecklistRow complete={analysisReviewed} label="Updated analysis reviewed" detail={analysisReviewed ? "Alex Kim confirmed the 1.29x downside result and policy comparison." : "The recalculated result still needs analyst sign-off."} />
          <ChecklistRow complete={Boolean(recommendation)} label="Recommendation submitted" detail={recommendation ? `${recommendation.author} submitted the package for senior decision.` : "Submission remains an analyst-owned action."} />
        </div>
      )}

      {!verified && (
        <Notice tone="warning" title="Recommendation is gated by source verification">
          The forecast is still missing or unverified, so the affected downside calculation cannot support a recommendation.
        </Notice>
      )}
      {verified && !analysisReviewed && (
        <Notice title="The model updated; the analyst has not signed off">
          Review the extracted forecast, the 1.29x downside coverage result, and the unchanged 1.20x policy floor before preparing a recommendation.
        </Notice>
      )}
      {recommendation && !seniorDecision && (
        <Notice title="Awaiting senior decision">
          Alex Kim’s recommendation is locked as a submitted record. Morgan Lee remains responsible for the final credit decision.
        </Notice>
      )}

      {analysisReviewed && (
        <div className={styles.recommendationRecord}>
          <div>
            <span>{seniorDecision ? "Final decision" : recommendation ? "Submitted recommendation" : "AI-assisted draft · Analyst editable"}</span>
            <h3>{seniorDecision ? seniorDecisionLabel(seniorDecision.decision) : recommendation?.decision ?? "Proceed with conditions"}</h3>
            <p>{seniorDecision?.rationale || recommendation?.rationale || "Verified downside coverage remains 0.09x above policy. The proposed facility is supportable with ongoing coverage reporting and annual forecast delivery."}</p>
          </div>
          <dl>
            <div><dt>Facility</dt><dd>{recommendation?.amount ?? "$15,000,000"}</dd></div>
            <div><dt>Downside FCCR</dt><dd>1.29x</dd></div>
            <div><dt>Policy floor</dt><dd>1.20x</dd></div>
            <div><dt>{seniorDecision ? "Decision maker" : recommendation ? "Prepared by" : "Owner"}</dt><dd>{seniorDecision?.decisionMaker ?? recommendation?.author ?? "Alex Kim"}</dd></div>
          </dl>
          <div className={styles.recommendationConditions}>
            <span>{seniorDecision ? seniorDecision.conditions.length ? "Decision conditions" : "Submitted conditions · Not approved" : "Proposed conditions"}</span>
            {(seniorDecision?.conditions.length ? seniorDecision.conditions : recommendation?.conditions ?? proposedConditions).map((condition) => <div key={condition}><Icon name="check" size="xs" /><span>{condition}</span></div>)}
          </div>
        </div>
      )}

      <div className={styles.recommendationActions}>
        {!verified && <Button variant="primary" onClick={() => onNavigate("sources")}>Resolve source verification</Button>}
        {verified && !analysisReviewed && <Button variant="primary" onClick={() => onNavigate("financials")}>Review updated analysis</Button>}
        {analysisReviewed && !recommendation && <Button variant="primary" onClick={() => setRecommendationOpen(true)}>Prepare recommendation</Button>}
        {recommendation && !seniorDecision && <Button variant="primary" onClick={() => onOpenSeniorReview?.()}>Open senior review</Button>}
        {seniorDecision?.decision === "return_to_analyst" && <Button variant="primary" onClick={onReopenReturnedRecommendation}>Revise recommendation</Button>}
        {seniorDecision && seniorDecision.decision !== "return_to_analyst" && <Button variant="secondary" onClick={() => onNavigate("activity")}>View decision history</Button>}
      </div>

      <LearningTarget topicId="northstar-recommendation"><RecommendationDrawer open={recommendationOpen} onClose={() => setRecommendationOpen(false)} onSubmit={(record) => { onSubmit(record); setRecommendationOpen(false); }} /></LearningTarget>
      {recommendation && <LearningTarget topicId="northstar-recommendation"><SeniorDecisionDrawer open={decisionOpen} recommendation={recommendation} onClose={() => setDecisionOpen(false)} onSubmit={(record) => { onSeniorDecision(record); setDecisionOpen(false); }} /></LearningTarget>}
    </section>
  );
}

function ChecklistRow({ complete, label, detail }: { complete: boolean; label: string; detail: string }) {
  return <div className={styles.checklistRow} data-complete={complete}><span><Icon name={complete ? "check" : "lock"} size="xs" /></span><div><strong>{label}</strong><small>{detail}</small></div><StatusPill tone={complete ? "success" : "neutral"}>{complete ? "Complete" : "Required"}</StatusPill></div>;
}

function recommendationStatus(state: NorthstarReviewState) {
  if (state.seniorDecision) return seniorDecisionLabel(state.seniorDecision.decision);
  if (state.recommendation) return "Awaiting senior decision";
  if (state.analysisReviewState === "completed") return "Ready to prepare";
  return "Not ready";
}

function RecommendationDrawer({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (record: Omit<AnalystRecommendationRecord, "author" | "createdAt">) => void }) {
  const [rationale, setRationale] = useState("Verified downside coverage remains 0.09x above the 1.20x policy floor. Northstar can support the requested revolving line with ongoing coverage reporting and annual forecast delivery.");
  const [conditions, setConditions] = useState(proposedConditions);
  return (
    <Drawer open={open} onClose={onClose} labelledBy="northstar-recommendation-drawer-title">
      <DrawerHeader onClose={onClose}><span className={styles.drawerEyebrow}>Analyst-owned action</span><h2 id="northstar-recommendation-drawer-title">Submit recommendation</h2><p>AI drafted the language from verified analysis. Alex Kim owns the final content and submission.</p></DrawerHeader>
      <DrawerBody>
        <DrawerSection className={styles.drawerSummary}><dl><div><dt>Recommendation</dt><dd>Proceed with conditions</dd></div><div><dt>Amount</dt><dd>$15,000,000</dd></div><div><dt>Next reviewer</dt><dd>Morgan Lee · Senior credit</dd></div></dl></DrawerSection>
        <DrawerSection><label className={styles.drawerField}><span>Analyst rationale</span><textarea value={rationale} onChange={(event) => setRationale(event.target.value)} /></label></DrawerSection>
        <DrawerSection><fieldset className={styles.drawerConditions}><legend>Proposed conditions</legend>{proposedConditions.map((condition) => <label key={condition}><input type="checkbox" checked={conditions.includes(condition)} onChange={() => setConditions((current) => current.includes(condition) ? current.filter((item) => item !== condition) : [...current, condition])} /><span>{condition}</span></label>)}</fieldset></DrawerSection>
      </DrawerBody>
      <DrawerFooter className={styles.drawerFooter}><small><Icon name="lock" size="xs" /> Creates an attributable handoff record.</small><Button variant="primary" disabled={!rationale.trim()} onClick={() => onSubmit({ decision: "Proceed with conditions", amount: "$15,000,000", rationale, conditions })}>Submit for senior review</Button></DrawerFooter>
    </Drawer>
  );
}

function SeniorDecisionDrawer({ open, recommendation, onClose, onSubmit }: { open: boolean; recommendation: AnalystRecommendationRecord; onClose: () => void; onSubmit: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void }) {
  const [decision, setDecision] = useState<SeniorDecisionRecord["decision"]>("approve_with_conditions");
  const [rationale, setRationale] = useState("");
  const [conditions, setConditions] = useState(recommendation.conditions);
  const rationaleRequired = decision === "return_to_analyst" || decision === "decline";
  const conditionsRequired = decision === "approve_with_conditions";
  const canSubmit = (!rationaleRequired || Boolean(rationale.trim())) && (!conditionsRequired || conditions.length > 0);
  return (
    <Drawer open={open} onClose={onClose} labelledBy="northstar-senior-decision-title">
      <DrawerHeader onClose={onClose}><span className={styles.drawerEyebrow}>Senior credit decision</span><h2 id="northstar-senior-decision-title">Northstar Health</h2><p>Review Alex Kim’s submitted recommendation and record the final human decision.</p></DrawerHeader>
      <DrawerBody>
        <DrawerSection className={styles.drawerSummary}><dl><div><dt>Analyst recommendation</dt><dd>{recommendation.decision}</dd></div><div><dt>Requested amount</dt><dd>{recommendation.amount}</dd></div><div><dt>Prepared by</dt><dd>{recommendation.author}</dd></div></dl></DrawerSection>
        <DrawerSection><fieldset className={styles.drawerOptions}><legend>Decision</legend>{([['approve','Approve'],['approve_with_conditions','Approve with conditions'],['return_to_analyst','Return to analyst'],['decline','Decline']] as Array<[SeniorDecisionRecord["decision"], string]>).map(([value, label]) => <label key={value} data-selected={decision === value}><input type="radio" name="northstar-senior-decision" checked={decision === value} onChange={() => setDecision(value)} /><span>{label}</span></label>)}</fieldset></DrawerSection>
        {conditionsRequired && <DrawerSection><fieldset className={styles.drawerConditions}><legend>Approval conditions</legend>{recommendation.conditions.map((condition) => <label key={condition}><input type="checkbox" checked={conditions.includes(condition)} onChange={() => setConditions((current) => current.includes(condition) ? current.filter((item) => item !== condition) : [...current, condition])} /><span>{condition}</span></label>)}</fieldset></DrawerSection>}
        <DrawerSection><label className={styles.drawerField}><span>Senior rationale · {rationaleRequired ? "Required" : "Optional"}</span><textarea value={rationale} placeholder={rationaleRequired ? "Explain what the analyst must address or why the request is declined…" : "Add decision reasoning or residual monitoring notes…"} onChange={(event) => setRationale(event.target.value)} /></label></DrawerSection>
      </DrawerBody>
      <DrawerFooter className={styles.drawerFooter}><small><Icon name="lock" size="xs" /> AI cannot submit this decision.</small><Button variant="primary" disabled={!canSubmit} onClick={() => onSubmit({ decision, rationale, conditions: conditionsRequired ? conditions : [] })}>Record final decision</Button></DrawerFooter>
    </Drawer>
  );
}
