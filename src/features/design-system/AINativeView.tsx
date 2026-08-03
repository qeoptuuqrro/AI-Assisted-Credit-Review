import { useState } from "react";
import { Icon, type IconName } from "../../shared/ui/Icon/Icon";
import styles from "./AINativeView.module.css";

type StoryPhaseId = "rules" | "consistency" | "proof";

type StoryPhase = {
  id: StoryPhaseId;
  index: string;
  title: string;
  kicker: string;
  icon: IconName;
  summary: string;
  exampleTitle: string;
  exampleCopy: string;
  artifacts: readonly string[];
  compounding: string;
};

const storyPhases: readonly StoryPhase[] = [
  {
    id: "rules",
    index: "01",
    title: "Set the rules",
    kicker: "A clear operating brief",
    icon: "clipboard",
    summary: "I turned product judgment into durable instructions so every task started with the same context.",
    exampleTitle: "A drawer critique became a shared contract",
    exampleCopy: "Instead of patching one credit-review screen, the drawer’s spacing, footer, focus, and responsive behavior became a reusable rule for the platform.",
    artifacts: ["Product workflow skill", "Design-system craft skill", "Drawer contract"],
    compounding: "The next drawer task inherits the decision instead of reopening the same debate.",
  },
  {
    id: "consistency",
    index: "02",
    title: "Build consistently",
    kicker: "One visual language",
    icon: "layers",
    summary: "I gave AI a stable product vocabulary: Salt tokens, shared components, and clear feature ownership.",
    exampleTitle: "Credit review became a governed surface",
    exampleCopy: "Workflow steps, notices, document viewers, drawers, and buttons now compose from the same tokens and contracts instead of drifting page by page.",
    artifacts: ["Salt token system", "29 production components", "Feature-owned CSS"],
    compounding: "A correction in a shared primitive improves every workflow that uses it.",
  },
  {
    id: "proof",
    index: "03",
    title: "Prove the result",
    kicker: "Evidence before confidence",
    icon: "checkCircle",
    summary: "I made quality observable: implementation, behavior, and visual fit are checked before a change becomes product truth.",
    exampleTitle: "The reassessment flow is verified end to end",
    exampleCopy: "Specialized agents challenge product logic, design-system drift, and regressions before the evidence-to-updated-assessment path is verified in the browser.",
    artifacts: ["Bounded audit agents", "Focused regression tests", "Browser and responsive QA"],
    compounding: "Each check feeds the next task with a sharper contract and less guesswork.",
  },
];

type Skill = {
  id: string;
  name: string;
  role: string;
  icon: IconName;
  question: string;
  proof: readonly {
    title: string;
    detail: string;
    icon: IconName;
  }[];
  artifacts: readonly string[];
  output: string;
};

const skills: readonly Skill[] = [
  {
    id: "product-workflow",
    name: "Product workflow",
    role: "For product decisions",
    icon: "scale",
    question: "What decision is the user actually making?",
    proof: [
      { title: "Customer A renewal", detail: "Mar 2027 → Mar 2030; Material → Moderate; concentration stays 61%.", icon: "fileCheck" },
      { title: "Verify before reassess", detail: "The state model blocks reassessment until source verification is complete.", icon: "shield" },
      { title: "Judgment stays human", detail: "Updated analysis and durable analyst judgment remain separate steps.", icon: "scale" },
    ],
    artifacts: ["Evidence workflow model", "Verification gate", "Judgment record"],
    output: "A shorter path from finding to judgment.",
  },
  {
    id: "product-architecture",
    name: "Product architecture",
    role: "For ownership decisions",
    icon: "branch",
    question: "Where should this behavior live?",
    proof: [
      { title: "Typed review domain", detail: "Findings, evidence, reassessments, judgments, recommendations, and decisions have separate owners.", icon: "branch" },
      { title: "Persistent review state", detail: "One persistence hook serves Meridian, Northstar, and standard reviews.", icon: "refresh" },
      { title: "Versioned design choices", detail: "Current, candidate, and archived designs cannot leak into production imports.", icon: "layers" },
    ],
    artifacts: ["Typed state model", "Persistence hook", "Design version registry"],
    output: "One clear home for each product rule.",
  },
  {
    id: "frontend-architecture",
    name: "Frontend architecture",
    role: "For implementation",
    icon: "command",
    question: "What should be reused before we add new code?",
    proof: [
      { title: "Shared Drawer contract", detail: "Responsive height, scroll containment, Escape, animation, and focus return live in one place.", icon: "panel" },
      { title: "Shared WorkflowSteps", detail: "Sequence and responsive navigation stay generic while reducers keep domain logic.", icon: "arrowRight" },
      { title: "Shared CaseStatusPill", detail: "Queue, bookmarks, drawers, headers, and the gallery use one status vocabulary.", icon: "tag" },
    ],
    artifacts: ["29 shared components", "Typed React boundaries", "Feature CSS Modules"],
    output: "Less duplication and safer changes.",
  },
  {
    id: "design-system-craft",
    name: "Design-system craft",
    role: "For visual quality",
    icon: "layers",
    question: "Which token, component, or state owns this visual decision?",
    proof: [
      { title: "Primitives → semantic roles", detail: "Salt maps color, type, spacing, motion, and shell geometry into product roles.", icon: "calculator" },
      { title: "Live Inspect mode", detail: "The gallery measures dimensions and exposes computed styles and mapped tokens.", icon: "eye" },
      { title: "Drift is a failing check", detail: "Duplicate tokens, raw values, and invalid marks fail the design-system audit.", icon: "checkCircle" },
    ],
    artifacts: ["Canonical token layer", "Live component specimens", "Contract checker"],
    output: "A product that feels related from screen to screen.",
  },
  {
    id: "browser-validation",
    name: "Browser validation",
    role: "For shipped confidence",
    icon: "checkCircle",
    question: "Does the result hold across real states and sizes?",
    proof: [
      { title: "Active-route matrix", detail: "The capture script records screenshots, fonts, overflow, failed images, dialogs, and console issues.", icon: "eye" },
      { title: "Interaction coverage", detail: "Decision gates, stage focus, scroll reset, radio navigation, and durable records are tested.", icon: "cursor" },
      { title: "Reassessment V9", detail: "The flow was checked across eight desktop, tablet, and mobile sizes.", icon: "checkCircle" },
    ],
    artifacts: ["Route capture script", "Interaction test suite", "Eight-size QA pass"],
    output: "Confidence grounded in the rendered product.",
  },
];

export function AINativeView() {
  const [activePhaseId, setActivePhaseId] = useState<StoryPhaseId>("rules");
  const [activeSkillId, setActiveSkillId] = useState(skills[0].id);
  const activePhase = storyPhases.find((phase) => phase.id === activePhaseId) ?? storyPhases[0];
  const activeSkill = skills.find((skill) => skill.id === activeSkillId) ?? skills[0];

  return (
    <div className={styles.view}>
      <section className={styles.hero} aria-labelledby="ai-native-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Icon name="spark" size="sm" /> AI-native product development</span>
          <h2 id="ai-native-title">How I worked with AI</h2>
          <p className={styles.heroStatement}>I designed a system for AI-assisted product development.</p>
          <p className={styles.heroBody}>The work was a repeatable loop: set the rules, build against them, then prove the result. That is what makes the output feel like one product instead of a collection of generated screens.</p>
          <div className={styles.principle}><Icon name="user" size="sm" /><span><strong>Human-owned.</strong> AI accelerated execution; I defined the rules, judged the output, and owned the product.</span></div>
        </div>

        <div className={styles.heroAside} aria-label="AI-native system at a glance">
          <span className={styles.heroAsideLabel}>The story in three moves</span>
          {storyPhases.map((phase) => (
            <div key={phase.id} className={styles.heroAsideRow}>
              <span>{phase.index}</span>
              <strong>{phase.title}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.storySection} aria-labelledby="story-title">
        <header className={styles.sectionHeader}>
          <span>01 · The story</span>
          <div>
            <h3 id="story-title">From a prompt to a product system</h3>
            <p>Each move creates a more useful constraint for the next one. Follow the thread, then open the skills underneath it.</p>
          </div>
        </header>

        <div className={styles.storyRail} role="group" aria-label="AI-native story phases">
          {storyPhases.map((phase) => (
            <button
              key={phase.id}
              type="button"
              className={activePhase.id === phase.id ? styles.storyPhaseActive : ""}
              aria-pressed={activePhase.id === phase.id}
              aria-controls="ai-native-story-detail"
              onClick={() => setActivePhaseId(phase.id)}
            >
              <span className={styles.storyPhaseTopline}>
                <span>{phase.index}</span>
                <Icon name={phase.icon} size="sm" />
              </span>
              <strong>{phase.title}</strong>
              <small>{phase.kicker}</small>
            </button>
          ))}
        </div>

        <article key={activePhase.id} id="ai-native-story-detail" className={styles.storyDetail} aria-live="polite">
          <div className={styles.storyDetailIntro}>
            <span>{activePhase.index} / {activePhase.kicker}</span>
            <h4>{activePhase.summary}</h4>
          </div>
          <div className={styles.storyExample}>
            <span>A real example</span>
            <strong>{activePhase.exampleTitle}</strong>
            <p>{activePhase.exampleCopy}</p>
          </div>
          <div className={styles.storyEvidence}>
            <div>
              <span>Artifacts</span>
              <ul>
                {activePhase.artifacts.map((artifact) => <li key={artifact}><Icon name="check" size="xs" />{artifact}</li>)}
              </ul>
            </div>
            <div>
              <span>Why it compounds</span>
              <p>{activePhase.compounding}</p>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.skillsSection} aria-labelledby="skills-title">
        <header className={styles.sectionHeader}>
          <span>02 · The skills</span>
          <div>
            <h3 id="skills-title">The playbooks behind the work</h3>
            <p>Five focused skills keep product thinking, implementation, and quality connected across the 29 shared components.</p>
          </div>
        </header>

        <div className={styles.skillExplorer}>
          <div className={styles.skillList} role="group" aria-label="AI-native skills">
            {skills.map((skill, index) => (
              <button
                key={skill.id}
                type="button"
                className={activeSkill.id === skill.id ? styles.skillActive : ""}
                aria-pressed={activeSkill.id === skill.id}
                aria-controls="ai-native-skill-detail"
                onClick={() => setActiveSkillId(skill.id)}
              >
                <span className={styles.skillNumber}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.skillIcon}><Icon name={skill.icon} size="sm" /></span>
                <span className={styles.skillLabel}><strong>{skill.name}</strong><small>{skill.role}</small></span>
                <Icon name="chevronRight" size="xs" />
              </button>
            ))}
          </div>

          <article key={activeSkill.id} id="ai-native-skill-detail" className={styles.skillDetail} aria-live="polite">
            <span className={styles.skillDetailRole}>{activeSkill.role}</span>
            <h4>{activeSkill.name}</h4>
            <p className={styles.skillQuestion}>{activeSkill.question}</p>
            <div className={styles.skillDetailGrid}>
              <div className={styles.skillProof}>
                <span>Project proof</span>
                <div className={styles.skillProofList}>
                  {activeSkill.proof.map((item) => (
                    <div key={item.title} className={styles.skillProofRow}>
                      <span className={styles.skillProofIcon}><Icon name={item.icon} size="sm" /></span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.skillOutcome}>
                <span>System artifacts</span>
                <ul>{activeSkill.artifacts.map((artifact) => <li key={artifact}><Icon name="check" size="xs" />{artifact}</li>)}</ul>
                <span className={styles.skillOutcomeLabel}>What it gives back</span>
                <p>{activeSkill.output}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <footer className={styles.closingStatement}>
        <span>03 · The outcome</span>
        <p>AI scaled execution. <strong>I defined the rules, judged the output, and owned the product.</strong></p>
      </footer>
    </div>
  );
}
