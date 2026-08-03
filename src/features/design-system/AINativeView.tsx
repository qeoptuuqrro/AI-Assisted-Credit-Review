import { useState } from "react";
import { Icon, type IconName } from "../../shared/ui/Icon/Icon";
import styles from "./AINativeView.module.css";

type AINativeLayerId = "skills" | "design-system" | "architecture" | "validation";

type AINativeLayer = {
  id: AINativeLayerId;
  index: string;
  title: string;
  eyebrow: string;
  icon: IconName;
  summary: string;
  governs: readonly string[];
  artifacts: readonly string[];
  proof: string;
  effect: string;
};

const layers: readonly AINativeLayer[] = [
  {
    id: "skills",
    index: "01",
    title: "Skills",
    eyebrow: "Persistent rules",
    icon: "spark",
    summary: "Codex starts with the product, architecture, and quality rules already in place.",
    governs: ["Product reasoning", "Implementation boundaries", "Required validation"],
    artifacts: ["Product workflow", "Frontend architecture", "Design-system craft"],
    proof: "Each task loads a focused operating playbook instead of relying on a larger one-off prompt.",
    effect: "Less repeated context and fewer inconsistent interpretations between tasks.",
  },
  {
    id: "design-system",
    index: "02",
    title: "Design system",
    eyebrow: "Visual language",
    icon: "layers",
    summary: "Repeated visual decisions become reusable tokens, components, states, and interaction contracts.",
    governs: ["Typography and spacing", "Semantic color", "Component behavior"],
    artifacts: ["Salt tokens", "29 production components", "Responsive contracts"],
    proof: "Generated pages consume established primitives rather than inventing styling screen by screen.",
    effect: "Faster composition with less visual drift across the platform.",
  },
  {
    id: "architecture",
    index: "03",
    title: "Architecture",
    eyebrow: "Clear ownership",
    icon: "branch",
    summary: "Every decision has one durable place to live, from a visual value to a workflow transition.",
    governs: ["Feature ownership", "Shared behavior", "Workflow state"],
    artifacts: ["Feature folders", "Shared UI", "Typed state models"],
    proof: "Product rules stay out of visual components, while page-specific composition stays out of shared UI.",
    effect: "AI can change the correct layer without creating hidden coupling or duplicate systems.",
  },
  {
    id: "validation",
    index: "04",
    title: "Agents + validation",
    eyebrow: "Governed execution",
    icon: "checkCircle",
    summary: "Specialized roles implement, challenge, inspect, and verify the work before it becomes product truth.",
    governs: ["Implementation quality", "Product coherence", "Regression control"],
    artifacts: ["Bounded agent roles", "Browser QA", "TypeScript and tests"],
    proof: "Rendering is only the first check; states, semantics, responsive behavior, and reuse are inspected too.",
    effect: "AI scales execution while human judgment retains ownership of the product.",
  },
];

const playbooks: ReadonlyArray<{
  name: string;
  role: string;
  icon: IconName;
  question: string;
  outcome: string;
}> = [
  {
    name: "Product workflow",
    role: "Product judgment",
    icon: "scale",
    question: "What decision is the user actually making?",
    outcome: "Coherent end-to-end flows",
  },
  {
    name: "Product architecture",
    role: "Ownership",
    icon: "branch",
    question: "Which feature should own this behavior?",
    outcome: "One durable home",
  },
  {
    name: "Frontend architecture",
    role: "Implementation",
    icon: "command",
    question: "Which existing pattern should be reused?",
    outcome: "Less duplication",
  },
  {
    name: "Design-system craft",
    role: "Visual governance",
    icon: "layers",
    question: "Which token or contract controls this?",
    outcome: "Consistent product language",
  },
  {
    name: "Browser validation",
    role: "Quality control",
    icon: "checkCircle",
    question: "Does it hold across states and sizes?",
    outcome: "Verified output",
  },
];

const feedbackSteps = [
  {
    label: "Signal",
    title: "A drawer breaks while scrolling",
    copy: "The problem appears in one workflow.",
    icon: "alertCircle" as const,
  },
  {
    label: "Trace",
    title: "Find the missing contract",
    copy: "The issue belongs to shared behavior, not page styling.",
    icon: "search" as const,
  },
  {
    label: "Strengthen",
    title: "Improve the shared layer",
    copy: "Update the Drawer contract and its validation rule.",
    icon: "shield" as const,
  },
  {
    label: "Propagate",
    title: "Every workflow inherits the fix",
    copy: "One correction improves the whole platform.",
    icon: "refresh" as const,
  },
] as const;

export function AINativeView() {
  const [activeLayerId, setActiveLayerId] = useState<AINativeLayerId>("skills");
  const activeLayer = layers.find((layer) => layer.id === activeLayerId) ?? layers[0];

  return (
    <div className={styles.view}>
      <section className={styles.hero} aria-labelledby="ai-native-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Icon name="spark" size="sm" /> AI-native product development</span>
          <h2 id="ai-native-title">I built the system that governs how AI builds the product.</h2>
          <p>Skills define the rules, the design system defines the language, architecture defines ownership, and specialized validation keeps the output honest.</p>
          <div className={styles.principle}><Icon name="user" size="sm" /><span><strong>Human-owned.</strong> AI accelerated execution; I defined the rules, judged the output, and owned the product.</span></div>
        </div>

        <dl className={styles.metrics} aria-label="AI-native system at a glance">
          <div><dt>Governance layers</dt><dd>4</dd></div>
          <div><dt>Focused playbooks</dt><dd>5</dd></div>
          <div><dt>Production components</dt><dd>29</dd></div>
          <div><dt>Compounding loop</dt><dd>1</dd></div>
        </dl>
      </section>

      <section className={styles.systemSection} aria-labelledby="operating-system-title">
        <header className={styles.sectionHeader}>
          <span>01 · The operating system</span>
          <div>
            <h3 id="operating-system-title">Four layers turn prompts into governed product work</h3>
            <p>Select a layer to see what it controls, where it lives, and why it compounds.</p>
          </div>
        </header>

        <div className={styles.layerMap} role="group" aria-label="AI-native operating system layers">
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={activeLayer.id === layer.id ? styles.layerActive : ""}
              aria-label={`${layer.index} ${layer.title} ${layer.eyebrow}`}
              aria-pressed={activeLayer.id === layer.id}
              aria-controls="ai-native-layer-detail"
              onClick={() => setActiveLayerId(layer.id)}
            >
              <span className={styles.layerIndex}>{layer.index}</span>
              <span className={styles.layerIcon}><Icon name={layer.icon} size="sm" /></span>
              <span className={styles.layerCopy}><strong>{layer.title}</strong><small>{layer.eyebrow}</small></span>
              <Icon name="chevronRight" size="xs" />
            </button>
          ))}
        </div>

        <article key={activeLayer.id} id="ai-native-layer-detail" className={styles.layerDetail} aria-live="polite">
          <div className={styles.detailLead}>
            <span>{activeLayer.index}</span>
            <div><small>{activeLayer.eyebrow}</small><h4>{activeLayer.title}</h4><p>{activeLayer.summary}</p></div>
          </div>
          <div className={styles.detailColumn}>
            <span>What it governs</span>
            <ul>{activeLayer.governs.map((item) => <li key={item}><Icon name="check" size="xs" /> {item}</li>)}</ul>
          </div>
          <div className={styles.detailColumn}>
            <span>System artifacts</span>
            <ul>{activeLayer.artifacts.map((item) => <li key={item}><Icon name="link" size="xs" /> {item}</li>)}</ul>
          </div>
          <div className={styles.detailOutcome}>
            <div><span>Proof in the product</span><p>{activeLayer.proof}</p></div>
            <div><span>Compounding effect</span><p>{activeLayer.effect}</p></div>
          </div>
        </article>
      </section>

      <section className={styles.playbookSection} aria-labelledby="playbooks-title">
        <header className={styles.sectionHeader}>
          <span>02 · The skill stack</span>
          <div>
            <h3 id="playbooks-title">Each playbook answers one hard question</h3>
            <p>The skills are executable operating rules, not a library of generic prompts.</p>
          </div>
        </header>

        <div className={styles.playbookLedger}>
          {playbooks.map((playbook, index) => (
            <article key={playbook.name} className={styles.playbookRow}>
              <span className={styles.playbookNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.playbookIcon}><Icon name={playbook.icon} size="sm" /></span>
              <div className={styles.playbookName}><small>{playbook.role}</small><strong>{playbook.name}</strong></div>
              <p>“{playbook.question}”</p>
              <span className={styles.playbookOutcome}><Icon name="arrowRight" size="xs" /> {playbook.outcome}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.feedbackSection} aria-labelledby="feedback-title">
        <header className={styles.sectionHeader}>
          <span>03 · The compounding loop</span>
          <div>
            <h3 id="feedback-title">Critique becomes infrastructure</h3>
            <p>A problem is not finished when one screen looks fixed. The system learns at the layer that caused it.</p>
          </div>
        </header>

        <ol className={styles.feedbackFlow}>
          {feedbackSteps.map((step, index) => (
            <li key={step.label}>
              <div className={styles.feedbackTopline}><span><Icon name={step.icon} size="sm" /></span><small>{step.label}</small></div>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
              {index < feedbackSteps.length - 1 && <span className={styles.feedbackConnector} aria-hidden="true"><Icon name="arrowRight" size="xs" /></span>}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.efficiencySection} aria-labelledby="efficiency-title">
        <header className={styles.sectionHeader}>
          <span>04 · Context efficiency</span>
          <div>
            <h3 id="efficiency-title">Reuse the system; spend attention on the decision</h3>
            <p>Token efficiency comes from loading durable rules instead of re-explaining the product every time.</p>
          </div>
        </header>

        <div className={styles.efficiencyMap}>
          <article className={styles.contextBefore}>
            <span>Ad hoc prompting</span>
            <strong>Every task repeats the operating context</strong>
            <ul>
              <li>Product rules</li>
              <li>Architecture boundaries</li>
              <li>Component conventions</li>
              <li>Validation checklist</li>
            </ul>
          </article>

          <div className={styles.contextTransition} aria-hidden="true"><Icon name="arrowRight" size="sm" /><span>Codify once</span></div>

          <article className={styles.contextAfter}>
            <span>AI-native task</span>
            <strong>Only task-specific judgment is new</strong>
            <div className={styles.contextInputs}>
              <span><Icon name="cursor" size="xs" /> Task intent</span>
              <span><Icon name="spark" size="xs" /> Matched skill</span>
              <span><Icon name="branch" size="xs" /> Repository context</span>
              <span><Icon name="checkCircle" size="xs" /> Validation</span>
            </div>
          </article>
        </div>
      </section>

      <footer className={styles.closingStatement}>
        <span><Icon name="spark" size="sm" /></span>
        <p>I did not just use AI to generate UI. <strong>I designed the system that governed how AI generated and maintained the product.</strong></p>
      </footer>
    </div>
  );
}
