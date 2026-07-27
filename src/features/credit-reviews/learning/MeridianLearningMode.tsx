import { createContext, useContext, useEffect, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { AppUtilityAction } from "../../../app/AppUtilityActions";
import { Button } from "../../../shared/ui/Button/Button";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection } from "../../../shared/ui/Drawer/Drawer";
import { Icon } from "../../../shared/ui/Icon/Icon";
import {
  meridianLearningTopicById,
  meridianLearningTopics,
  type LearningLevel,
  meridianLearningTopicIdsByScope,
  platformLearningTopicIdsByScope,
  type MeridianLearningScope,
  type PlatformLearningScope,
  type MeridianLearningTopicId,
} from "./meridianLearningContent";
import styles from "./MeridianLearningMode.module.css";

type LearningTargetProps = {
  "data-learning-target"?: MeridianLearningTopicId;
  "data-learning-label"?: string;
  tabIndex?: number;
};

export function getLearningTargetProps(
  enabled: boolean,
  topicId: MeridianLearningTopicId,
): LearningTargetProps {
  if (!enabled) return {};
  const topic = meridianLearningTopicById[topicId];

  return {
    "data-learning-target": topicId,
    "data-learning-label": topic.shortLabel,
    tabIndex: 0,
  };
}

export type LearningSurfaceScope = MeridianLearningScope | PlatformLearningScope;

type LearningModeContextValue = { enabled: boolean };
const LearningModeContext = createContext<LearningModeContextValue>({ enabled: false });

export function useLearningMode() {
  return useContext(LearningModeContext);
}

export function LearningTarget({ topicId, children }: { topicId: MeridianLearningTopicId; children: ReactNode }) {
  const { enabled } = useLearningMode();
  return <>{enabled ? <div {...getLearningTargetProps(true, topicId)}>{children}</div> : children}</>;
}

export function getLearningTopicIdsForScope(scope: LearningSurfaceScope): MeridianLearningTopicId[] {
  return scope in meridianLearningTopicIdsByScope
    ? meridianLearningTopicIdsByScope[scope as MeridianLearningScope]
    : platformLearningTopicIdsByScope[scope as PlatformLearningScope];
}

/**
 * Route-agnostic Learning Mode boundary for queues and case variants.
 * It owns the same interception contract as the Meridian workspace while
 * leaving page layout and workflow state in the route owner.
 */
export function LearningModeSurface({ scope, children, inlineToggle = false }: { scope: LearningSurfaceScope; children: ReactNode; inlineToggle?: boolean }) {
  const topicIds = getLearningTopicIdsForScope(scope);
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [topicId, setTopicId] = useState<MeridianLearningTopicId>(topicIds[0]);

  useEffect(() => {
    setTopicId(topicIds[0]);
    setOpen(false);
  }, [scope, topicIds.join("|")]);

  function openTopic(nextTopicId: MeridianLearningTopicId) {
    setTopicId(topicIds.includes(nextTopicId) ? nextTopicId : topicIds[0]);
    setOpen(true);
  }

  function learningTargetFromEvent(target: EventTarget | null) {
    if (!(target instanceof Element) || target.closest("[data-learning-control]")) return null;
    const owner = target.closest<HTMLElement>("[data-learning-target]");
    const nextTopicId = owner?.dataset.learningTarget as MeridianLearningTopicId | undefined;
    return nextTopicId && topicIds.includes(nextTopicId) ? nextTopicId : null;
  }

  function inspectClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!enabled) return;
    const nextTopicId = learningTargetFromEvent(event.target);
    if (!nextTopicId) return;
    event.preventDefault();
    event.stopPropagation();
    openTopic(nextTopicId);
  }

  function inspectKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!enabled || (event.key !== "Enter" && event.key !== " ")) return;
    const nextTopicId = learningTargetFromEvent(event.target);
    if (!nextTopicId) return;
    event.preventDefault();
    event.stopPropagation();
    openTopic(nextTopicId);
  }

  useEffect(() => {
    if (!enabled) return;

    const inspectDocumentClick = (event: MouseEvent) => {
      const nextTopicId = learningTargetFromEvent(event.target);
      if (!nextTopicId) return;
      event.preventDefault();
      event.stopPropagation();
      openTopic(nextTopicId);
    };
    const inspectDocumentKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const nextTopicId = learningTargetFromEvent(event.target);
      if (!nextTopicId) return;
      event.preventDefault();
      event.stopPropagation();
      openTopic(nextTopicId);
    };

    document.addEventListener("click", inspectDocumentClick, true);
    document.addEventListener("keydown", inspectDocumentKey, true);
    return () => {
      document.removeEventListener("click", inspectDocumentClick, true);
      document.removeEventListener("keydown", inspectDocumentKey, true);
    };
  }, [enabled, topicIds.join("|")]);

  function toggle() {
    setEnabled((current) => {
      const next = !current;
      setOpen(next);
      return next;
    });
  }

  return (
    <LearningModeContext.Provider value={{ enabled }}>
      <div className={styles.learningSurface} data-learning-mode={enabled || undefined} onClickCapture={inspectClick} onKeyDownCapture={inspectKey}>
        {inlineToggle && <div className={styles.inlineToggle}><MeridianLearningToggle enabled={enabled} onToggle={toggle} /></div>}
        {children}
        <AppUtilityAction><MeridianLearningToggle enabled={enabled} onToggle={toggle} /></AppUtilityAction>
        <MeridianLearningPanel open={open} topicId={topicId} topicIds={topicIds} onSelectTopic={openTopic} onClose={() => setOpen(false)} />
      </div>
    </LearningModeContext.Provider>
  );
}

export function MeridianLearningToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <Button
      size="sm"
      variant={enabled ? "soft" : "quiet"}
      className={styles.toggle}
      icon={<Icon name={enabled ? "cursor" : "help"} size="sm" />}
      iconPosition="start"
      aria-pressed={enabled}
      data-learning-control
      onClick={onToggle}
    >
      {enabled ? "Learning on" : "Learn this page"}
    </Button>
  );
}

type MeridianLearningPanelProps = {
  open: boolean;
  topicId: MeridianLearningTopicId;
  topicIds?: MeridianLearningTopicId[];
  onSelectTopic: (topicId: MeridianLearningTopicId) => void;
  onStartWalkthrough?: () => void;
  onClose: () => void;
};

export function MeridianLearningPanel({ open, topicId, topicIds, onSelectTopic, onStartWalkthrough, onClose }: MeridianLearningPanelProps) {
  const [level, setLevel] = useState<LearningLevel>("simple");
  const topic = meridianLearningTopicById[topicId];
  const scopedTopics = topicIds?.map((id) => meridianLearningTopicById[id]) ?? meridianLearningTopics;
  const visibleTopics = scopedTopics.some((item) => item.id === topicId) ? scopedTopics : meridianLearningTopics;
  const topicIndex = visibleTopics.findIndex((item) => item.id === topicId);
  const previous = visibleTopics.at(topicIndex - 1);
  const next = visibleTopics.at(topicIndex + 1);

  useEffect(() => {
    setLevel("simple");
  }, [topicId]);

  return (
    <Drawer open={open} onClose={onClose} labelledBy="learning-panel-title" className={styles.drawer}>
      <DrawerHeader onClose={onClose}>
        <span className={styles.drawerEyebrow}>{topic.category}</span>
        <h2 id="learning-panel-title">{topic.title}</h2>
      </DrawerHeader>

      <DrawerBody>
        <div className={styles.levelSwitch} role="group" aria-label="Explanation detail">
          <button type="button" data-active={level === "simple"} aria-pressed={level === "simple"} onClick={() => setLevel("simple")}>
            Plain English
          </button>
          <button type="button" data-active={level === "professional"} aria-pressed={level === "professional"} onClick={() => setLevel("professional")}>
            Credit view
          </button>
        </div>

        <DrawerSection className={styles.meaningSection}>
          <span className={styles.sectionLabel}>{level === "simple" ? "What it means" : "Professional definition"}</span>
          <p className={styles.lead}>{level === "simple" ? topic.simple : topic.professional}</p>
          {topic.example && <div className={styles.example}><Icon name="spark" size="sm" /><span>{topic.example}</span></div>}
        </DrawerSection>

        {topic.id === "page-story" && onStartWalkthrough && (
          <DrawerSection className={styles.walkthroughCard}>
            <div>
              <span className={styles.sectionLabel}>Prefer a story?</span>
              <p>Follow Meridian from request to senior decision in eight short steps.</p>
            </div>
            <Button size="sm" variant="secondary" icon={<Icon name="arrowRight" size="xs" />} onClick={onStartWalkthrough}>
              Walk me through Meridian
            </Button>
          </DrawerSection>
        )}

        <DrawerSection>
          <span className={styles.sectionLabel}>How the AI got here</span>
          <ol className={styles.aiSteps}>
            {topic.aiSteps.map((step) => <li key={step}><span>{step}</span></li>)}
          </ol>
        </DrawerSection>

        <DrawerSection>
          <span className={styles.sectionLabel}>Why this is on the page</span>
          <p>{topic.whyHere}</p>
        </DrawerSection>

        <DrawerSection>
          <span className={styles.sectionLabel}>Say it in the presentation</span>
          <blockquote>“{topic.presenterLine}”</blockquote>
        </DrawerSection>

        <DrawerSection>
          <span className={styles.sectionLabel}>Evidence trail</span>
          <div className={styles.sourceTrail}>
            {topic.sourceTrail.map((source) => <span key={source}><Icon name="fileCheck" size="xs" />{source}</span>)}
          </div>
          <div className={styles.humanCheck}>
            <Icon name="user" size="sm" />
            <span><strong>Human check</strong>{topic.humanCheck}</span>
          </div>
        </DrawerSection>
      </DrawerBody>

      <DrawerFooter className={styles.footer}>
        <span>{topicIndex + 1} of {visibleTopics.length}</span>
        <div>
          <Button size="sm" variant="quiet" disabled={!previous} onClick={() => previous && onSelectTopic(previous.id)}>Previous</Button>
          <Button size="sm" variant="secondary" disabled={!next} icon={<Icon name="arrowRight" size="xs" />} onClick={() => next && onSelectTopic(next.id)}>Next</Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
