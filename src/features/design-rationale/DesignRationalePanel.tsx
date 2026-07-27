import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection } from "../../shared/ui/Drawer/Drawer";
import { Icon } from "../../shared/ui/Icon/Icon";
import styles from "./DesignRationalePanel.module.css";

type DesignRationale = {
  category: string;
  title: string;
  summary: string;
  decisions: Array<{ title: string; explanation: string }>;
  guidance: string;
};

const rationaleBySurface = {
  designSystem: {
    category: "Design system",
    title: "Why this page is structured as a living system",
    summary: "This workspace keeps foundations, components, patterns, and templates in one inspectable hierarchy so the product language can be evaluated in context instead of as disconnected examples.",
    decisions: [
      { title: "Foundations before composition", explanation: "Tokens and typography establish the rules that every component and workflow surface inherits." },
      { title: "Live states over static samples", explanation: "Controls are shown in default, hover, focus, and disabled states so interaction quality is reviewed alongside appearance." },
      { title: "Preview and inspect stay together", explanation: "Preview preserves the product experience; Inspect reveals implementation properties without sending the reviewer to another tool." },
    ],
    guidance: "Move between the four section tabs to change the level of the system. Use Preview for normal interaction and Inspect when you need to understand the tokens and geometry behind a specimen.",
  },
  overview: {
    category: "Workspace overview",
    title: "Why the homepage leads with flow and action",
    summary: "The overview is a portfolio command surface: it answers what changed, what needs attention, and which review the analyst should open next.",
    decisions: [
      { title: "One portfolio story", explanation: "The primary visualization shows workload movement rather than repeating the same totals across several KPI cards." },
      { title: "Personal work stays adjacent", explanation: "The action queue sits beside portfolio context so system-level change immediately connects to an owned task." },
      { title: "Progressive detail", explanation: "Secondary context stays compact until the analyst chooses a week, status, or review." },
    ],
    guidance: "Start with the portfolio trend, then use the personal action queue to enter the review with the highest urgency or clearest next step.",
  },
  intelligence: {
    category: "Intelligence",
    title: "Why intelligence uses a focused conversation",
    summary: "The page keeps the analyst's question and the system's attributed answer in one bounded reading flow, with evidence available next to the claim it supports.",
    decisions: [
      { title: "Conversation before dashboard", explanation: "The interface prioritizes the analyst's question instead of presenting a generic wall of metrics." },
      { title: "Evidence beside claims", explanation: "Sources expand where they matter so verification does not require a separate investigation path." },
      { title: "Visible work", explanation: "Preparation steps explain what the system is doing without overwhelming the final answer." },
    ],
    guidance: "Ask a portfolio or case question, inspect the cited evidence, and follow the linked review when the answer identifies a decision that needs human ownership.",
  },
  queue: {
    category: "Credit review queue",
    title: "Why the queue is built for scan, compare, and act",
    summary: "The queue keeps priority signals in a dense ledger and opens review detail alongside it, preserving the comparison context analysts need to triage work.",
    decisions: [
      { title: "Outcome-led rows", explanation: "Status, owner, timing, and next action carry more weight than decorative card treatment." },
      { title: "Detail without losing the list", explanation: "The preview rail keeps the selected case connected to the surrounding queue." },
      { title: "Filters stay lightweight", explanation: "Compact controls narrow the collection without turning filtering into a separate mode." },
    ],
    guidance: "Filter to the relevant workload, scan the outcome and due signals, then open a row to verify prerequisites and findings before entering the full review.",
  },
  review: {
    category: "Credit review",
    title: "Why the case workspace follows the decision journey",
    summary: "The workspace separates overview, findings, financials, sources, activity, and recommendation while keeping them attached to one durable case record.",
    decisions: [
      { title: "Evidence before recommendation", explanation: "Findings and source verification remain explicit prerequisites for an analyst-owned recommendation." },
      { title: "System and human views stay separate", explanation: "Automated assessment remains attributable and read-only while analyst judgment is recorded as its own action." },
      { title: "Activity is the connective tissue", explanation: "Evidence, reassessment, judgment, and handoff events remain traceable throughout the workflow." },
    ],
    guidance: "Use the overview to orient, resolve findings and evidence in their dedicated sections, then draft the recommendation only when the readiness state confirms the review is complete.",
  },
  workspace: {
    category: "Workspace",
    title: "Why this surface stays focused and operational",
    summary: "The interface uses a quiet shell, compact controls, and progressive disclosure so decision-relevant content remains the visual priority.",
    decisions: [
      { title: "Stable navigation", explanation: "Primary destinations and saved reviews remain predictable while the main canvas changes with the task." },
      { title: "Compact utilities", explanation: "Global actions stay available without competing with page-level decisions." },
      { title: "Shared interaction language", explanation: "Drawers, tabs, status labels, and buttons follow the same contracts across workflows." },
    ],
    guidance: "Use the primary navigation for workspace-level changes and the page's own actions for the current task. Supporting explanation remains available here without occupying the canvas.",
  },
} satisfies Record<string, DesignRationale>;

export function getDesignRationale(pathname: string): DesignRationale {
  if (pathname === "/design-system") return rationaleBySurface.designSystem;
  if (pathname === "/" || pathname === "/overview") return rationaleBySurface.overview;
  if (pathname === "/intelligence") return rationaleBySurface.intelligence;
  if (pathname === "/credit-reviews") return rationaleBySurface.queue;
  if (pathname.startsWith("/credit-reviews/")) return rationaleBySurface.review;
  return rationaleBySurface.workspace;
}

export function DesignRationalePanel({ open, pathname, onClose }: { open: boolean; pathname: string; onClose: () => void }) {
  const rationale = getDesignRationale(pathname);

  return (
    <Drawer open={open} onClose={onClose} labelledBy="design-rationale-title" className={styles.drawer}>
      <DrawerHeader onClose={onClose}>
        <span className={styles.eyebrow}>{rationale.category}</span>
        <h2 id="design-rationale-title">{rationale.title}</h2>
      </DrawerHeader>
      <DrawerBody>
        <DrawerSection className={styles.summarySection}>
          <span className={styles.sectionLabel}>Design intent</span>
          <p className={styles.summary}>{rationale.summary}</p>
        </DrawerSection>
        <DrawerSection>
          <span className={styles.sectionLabel}>Key decisions</span>
          <ul className={styles.decisionList}>
            {rationale.decisions.map((decision) => (
              <li key={decision.title}>
                <span className={styles.decisionIcon}><Icon name="check" size="xs" /></span>
                <span><strong>{decision.title}</strong>{decision.explanation}</span>
              </li>
            ))}
          </ul>
        </DrawerSection>
        <DrawerSection>
          <span className={styles.sectionLabel}>How to use this page</span>
          <p>{rationale.guidance}</p>
        </DrawerSection>
      </DrawerBody>
      <DrawerFooter className={styles.footer}>
        <Icon name="book" size="sm" />
        <span>Page-aware design documentation</span>
      </DrawerFooter>
    </Drawer>
  );
}
