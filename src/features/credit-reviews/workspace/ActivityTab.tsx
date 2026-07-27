import { useEffect, useMemo, useState } from "react";
import { ActivityLedger } from "../../../shared/ui/ActivityLedger/ActivityLedger";
import { FilterChip } from "../../../shared/ui/FilterChip/FilterChip";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { Timeline } from "../../../shared/ui/Timeline/Timeline";
import { type ActivityFilter, type ReviewActivity } from "./meridianData";
import { getCreditActivityPresentation } from "../creditReviewPresentation";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import styles from "./MeridianReviewWorkspace.module.css";

type ActivityTabProps = {
  activity: ReviewActivity[];
  variant?: "timeline" | "ledger" | "connected-timeline";
  learningMode?: boolean;
};

const filters: Array<{ id: ActivityFilter; label: string }> = [
  { id: "all", label: "All activity" },
  { id: "ai", label: "Reassessments" },
  { id: "human", label: "Analyst actions" },
  { id: "evidence", label: "Evidence" },
  { id: "decision", label: "Decisions" },
];

export function ActivityTab({ activity, variant = "ledger", learningMode = false }: ActivityTabProps) {
  const learn = (topicId: "activity-story" | "activity-filters" | "activity-timeline") => getLearningTargetProps(learningMode, topicId);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(variant === "timeline" ? activity[0]?.id ?? null : null);
  const visibleActivity = useMemo(() => filter === "all" ? activity : activity.filter((event) => event.type === filter), [activity, filter]);
  const showFilters = activity.length >= 4;

  useEffect(() => {
    setExpandedId(variant === "timeline" ? activity[0]?.id ?? null : null);
  }, [activity, variant]);

  return (
    <div className={styles.activityLayout}>
      <section className={styles.activityCard}>
        <div {...learn("activity-story")}><SectionHeader
          title={variant === "timeline" ? "Decision history" : "Activity"}
          description={variant === "timeline" ? "Who changed what, which evidence caused it, and how the credit conclusion moved." : "Evidence, analyst actions, and decision changes in one attributable record."}
        /></div>
        {showFilters && (
          <div className={styles.activityFilters} aria-label="Activity filters" {...learn("activity-filters")}>
            {filters.map((item) => <FilterChip key={item.id} pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</FilterChip>)}
          </div>
        )}
        <div {...learn("activity-timeline")}>
        {variant === "timeline" ? (
          <Timeline
            className={styles.activityTimeline}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId((current) => current === id ? null : id)}
            items={visibleActivity.map((event) => ({ id: event.id, title: event.title, meta: event.meta, description: event.description, tone: event.tone, details: event.detail }))}
          />
        ) : (
          <ActivityLedger
            className={styles.activityLedger}
            layout={variant === "connected-timeline" ? "timeline" : "ledger"}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId((current) => current === id ? null : id)}
            items={visibleActivity.map((event) => ({
              id: event.id,
              title: event.title,
              meta: event.meta,
              description: event.description,
              details: event.detail,
              ...getCreditActivityPresentation(event.type, event.tone === "warning"),
            }))}
          />
        )}
        </div>
      </section>
    </div>
  );
}
