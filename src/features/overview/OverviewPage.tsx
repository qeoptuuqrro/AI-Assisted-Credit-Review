import { useMemo, useState } from "react";
import { AppLink, useRouter, type AppPath } from "../../app/router";
import { aiReviewStatus, reviews, type CreditReview } from "../credit-reviews/reviewData";
import { companyLogoDomains } from "../credit-reviews/companyLogos";
import { getDesignOption } from "../design-tools/designOptions";
import { CompanyLogo } from "../../shared/ui/CompanyLogo/CompanyLogo";
import { DesignVariantNotice } from "../../shared/ui/DesignVariantNotice/DesignVariantNotice";
import { Icon, type IconName } from "../../shared/ui/Icon/Icon";
import { Panel } from "../../shared/ui/Panel/Panel";
import { StatusPill } from "../../shared/ui/StatusPill/StatusPill";
import { Tabs, type TabItem } from "../../shared/ui/Tabs/Tabs";
import styles from "./OverviewPage.module.css";
import { getLearningTargetProps, LearningModeSurface, useLearningMode } from "../credit-reviews/learning/MeridianLearningMode";

type QueueView = "priority" | "updated" | "decision";
type PortfolioChartVariant = "bars" | "trend" | "refined";
type FlowChartPoint = { x: number; y: number };

const portfolioStatuses = [
  { label: "Needs attention", count: 21, tone: "attention" },
  { label: "In review", count: 29, tone: "review" },
  { label: "Ready for decision", count: 11, tone: "ready" },
  { label: "Completed", count: 7, tone: "complete" },
] as const;

const portfolioFlow = [
  { label: "Jun 22", attention: 18, review: 26, ready: 8 },
  { label: "Jun 29", attention: 17, review: 27, ready: 9 },
  { label: "Jul 6", attention: 19, review: 25, ready: 9 },
  { label: "Jul 13", attention: 16, review: 28, ready: 10 },
  { label: "Jul 20", attention: 19, review: 29, ready: 10 },
  { label: "Jul 27", attention: 21, review: 29, ready: 11 },
] as const;

const flowChartGeometry = {
  width: 600,
  top: 8,
  baseline: 124,
  inset: 12,
  max: 65,
} as const;

const momentumChartGeometry = {
  width: 600,
  top: 10,
  baseline: 124,
  inset: 12,
  min: 48,
  max: 64,
} as const;

function createFlowChartPoints(valueForWeek: (week: (typeof portfolioFlow)[number]) => number): FlowChartPoint[] {
  const usableWidth = flowChartGeometry.width - (flowChartGeometry.inset * 2);
  return portfolioFlow.map((week, index) => ({
    x: flowChartGeometry.inset + ((usableWidth * index) / (portfolioFlow.length - 1)),
    y: flowChartGeometry.baseline - ((valueForWeek(week) / flowChartGeometry.max) * (flowChartGeometry.baseline - flowChartGeometry.top)),
  }));
}

function createSmoothPath(points: FlowChartPoint[]) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    if (!previous) return path;
    const middleX = (previous.x + point.x) / 2;
    return `${path} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function createMomentumChartPoints(): FlowChartPoint[] {
  const usableWidth = momentumChartGeometry.width - (momentumChartGeometry.inset * 2);
  const usableHeight = momentumChartGeometry.baseline - momentumChartGeometry.top;
  const valueRange = momentumChartGeometry.max - momentumChartGeometry.min;
  return portfolioFlow.map((week, index) => {
    const value = week.attention + week.review + week.ready;
    return {
      x: momentumChartGeometry.inset + ((usableWidth * index) / (portfolioFlow.length - 1)),
      y: momentumChartGeometry.baseline - (((value - momentumChartGeometry.min) / valueRange) * usableHeight),
    };
  });
}

const queueTabs = [
  { id: "priority", label: "Priority" },
  { id: "updated", label: "Recently updated" },
  { id: "decision", label: "Decision-ready" },
] satisfies Array<TabItem<QueueView>>;

function reviewPath(review: CreditReview): AppPath {
  return `/credit-reviews/${review.slug}` as AppPath;
}

export function OverviewPage() {
  return <LearningModeSurface scope="overview"><OverviewPageContent /></LearningModeSurface>;
}

function OverviewPageContent() {
  const { navigate, pathname, search } = useRouter();
  const { enabled } = useLearningMode();
  const [queueView, setQueueView] = useState<QueueView>("priority");
  const selectedDesign = getDesignOption(new URLSearchParams(search).get("design"));
  const showBalancedV1 = selectedDesign?.renderKey === "workspace-balanced-dashboard";
  const showTrendFlowV3 = selectedDesign?.renderKey === "workspace-trend-flow-dashboard";
  const showRefinedMomentumV4 = selectedDesign?.renderKey === "workspace-refined-momentum-dashboard";
  const myReviews = useMemo(() => reviews.filter((review) => review.owner === "Alex Kim"), []);
  const needsJudgment = myReviews.filter((review) => review.aiReviewState === "needs-judgment");
  const needsVerification = myReviews.filter((review) => review.aiReviewState === "needs-verification");
  const awaitingDecision = myReviews.filter((review) => review.status === "ready-for-decision");

  const focusReviews = useMemo(() => myReviews
    .filter((review) => review.status === "needs-attention")
    .sort((left, right) => Number(right.dueGroup === "urgent") - Number(left.dueGroup === "urgent"))
    .slice(0, 3), [myReviews]);

  const queueReviews = useMemo(() => {
    if (queueView === "updated") {
      return myReviews.filter((review) => review.aiReviewState === "analysis-updated" || review.aiReviewState === "analysis-ready").slice(0, 5);
    }
    if (queueView === "decision") {
      return reviews.filter((review) => review.status === "ready-for-decision" || review.status === "completed").slice(0, 5);
    }
    return myReviews
      .filter((review) => review.status === "needs-attention")
      .sort((left, right) => Number(right.dueGroup === "urgent") - Number(left.dueGroup === "urgent"))
      .slice(0, 5);
  }, [myReviews, queueView]);

  const operationalCards: Array<{ label: string; value: number; description: string; icon: IconName; tone: string; search: string }> = [
    { label: "Needs judgment", value: needsJudgment.length, description: "Analyst decisions are holding the review.", icon: "scale", tone: "judgment", search: "?focus=needs-judgment" },
    { label: "Evidence outstanding", value: needsVerification.length, description: "Source verification or new evidence is required.", icon: "fileCheck", tone: "evidence", search: "?focus=needs-verification" },
    { label: "Awaiting decision", value: awaitingDecision.length, description: "Recommendations are ready for approver review.", icon: "checkCircle", tone: "decision", search: "?focus=ready-for-decision" },
  ];

  return (
    <div className={styles.page}>
      {(showBalancedV1 || showTrendFlowV3 || showRefinedMomentumV4) && (
        <DesignVariantNotice
          area="Workspace overview"
          variant={showBalancedV1 ? "V1 · Balanced status dashboard" : showRefinedMomentumV4 ? "V4 · Momentum + mix" : "V3 · Trend flow chart"}
          onReturn={() => navigate(pathname, { replace: true })}
        />
      )}

      <header className={styles.pageHeader} {...getLearningTargetProps(enabled, "overview-command-center")}>
        <div>
          <h1>Welcome, Alex</h1>
          <p>Here’s what needs attention across your lending workspace.</p>
        </div>
      </header>

      <nav className={styles.quickActions} aria-label="Quick actions">
        <AppLink className={styles.primaryQuickAction} to="/credit-reviews"><span><Icon name="clipboard" size="sm" /></span>Open review queue</AppLink>
        <AppLink to="/credit-reviews" search="?focus=needs-judgment"><span><Icon name="scale" size="sm" /></span>Needs judgment</AppLink>
        <AppLink to="/credit-reviews" search="?focus=needs-verification"><span><Icon name="fileCheck" size="sm" /></span>Evidence requests</AppLink>
      </nav>

      {showBalancedV1 ? (
        <BalancedStatusDashboard
          myReviews={myReviews}
          awaitingDecision={awaitingDecision}
          operationalCards={operationalCards}
        />
      ) : (
        <section className={styles.commandGrid} aria-label="Lending operating summary" {...getLearningTargetProps(enabled, "overview-command-center")}>
          <Panel className={styles.flowCard}>
            <div className={styles.cardHeader}>
              <div>
                <span>Portfolio review status</span>
                <strong>68 reviews</strong>
              </div>
              <AppLink to="/credit-reviews">View all</AppLink>
            </div>
            <PortfolioFlowChart variant={showRefinedMomentumV4 ? "refined" : showTrendFlowV3 ? "trend" : "bars"} />
          </Panel>

          <Panel className={styles.focusCard} {...getLearningTargetProps(enabled, "overview-workload")}>
            <div className={styles.cardHeader}>
              <div>
                <span>My workload</span>
                <strong>{myReviews.length} assigned reviews</strong>
              </div>
              <AppLink to="/credit-reviews">Open queue</AppLink>
            </div>

            <div className={styles.focusSummary}>
              <div>
                <strong>{myReviews.filter((review) => review.status === "needs-attention").length}</strong>
                <span>need your action</span>
              </div>
              <div>
                <strong>{myReviews.filter((review) => review.dueGroup === "urgent").length}</strong>
                <span>due in 48 hours</span>
              </div>
            </div>

            <div className={styles.focusList} aria-label="Next assigned reviews">
              {focusReviews.map((review) => (
                <button
                  type="button"
                  key={review.slug}
                  aria-label={`${review.company}, ${aiReviewStatus[review.aiReviewState].label}, due ${review.due}`}
                  onClick={() => navigate(reviewPath(review))}
                >
                  <CompanyLogo domain={companyLogoDomains[review.company]} name={review.company} />
                  <span>
                    <strong>{review.company}</strong>
                    <small>{aiReviewStatus[review.aiReviewState].label}</small>
                  </span>
                  <span className={review.dueGroup === "urgent" ? styles.focusDueUrgent : styles.focusDue}>{review.due}</span>
                  <Icon name="chevronRight" size="sm" />
                </button>
              ))}
            </div>

            <div className={styles.focusFooter}>
              <span><Icon name="checkCircle" size="sm" /> {awaitingDecision.length} recommendations ready</span>
              <AppLink to="/credit-reviews" search="?focus=ready-for-decision">Review decisions</AppLink>
            </div>
          </Panel>
        </section>
      )}

      <section className={styles.queueSection} aria-labelledby="priority-reviews-title" {...getLearningTargetProps(enabled, "overview-workload")}>
        <header className={styles.sectionHeader}>
          <div>
            <h2 id="priority-reviews-title">Review activity</h2>
            <p>Cases that are most useful to pick up next.</p>
          </div>
          <AppLink to="/credit-reviews">View all reviews</AppLink>
        </header>

        <Tabs<QueueView> className={styles.queueTabs} ariaLabel="Review activity view" items={queueTabs} value={queueView} onChange={setQueueView} />

        <div className={styles.queueLedger} id={`${queueView}-panel`} role="tabpanel" aria-labelledby={`${queueView}-tab`}>
          <div className={styles.queueHeader} aria-hidden="true">
            <span>Company</span><span>Request</span><span>Review status</span><span>Due</span>
          </div>
          {queueReviews.map((review) => (
            <button className={styles.queueRow} type="button" key={review.slug} onClick={() => navigate(reviewPath(review))}>
              <span className={styles.companyCell}>
                <CompanyLogo domain={companyLogoDomains[review.company]} name={review.company} />
                <span><strong>{review.company}</strong><small>{review.facilityType}</small></span>
              </span>
              <span className={styles.requestCell}>{review.request}</span>
              <span><StatusPill tone={aiReviewStatus[review.aiReviewState].tone}>{aiReviewStatus[review.aiReviewState].label}</StatusPill></span>
              <span className={review.dueGroup === "urgent" ? styles.dueUrgent : styles.due}>{review.due}<Icon name="chevronRight" size="sm" /></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function PortfolioFlowChart({ variant = "bars" }: { variant?: PortfolioChartVariant }) {
  const currentIndex = portfolioFlow.length - 1;
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const selectedWeek = portfolioFlow[activeIndex];
  const priorWeek = portfolioFlow[Math.max(0, activeIndex - 1)];
  const activeTotal = selectedWeek.attention + selectedWeek.review + selectedWeek.ready;
  const priorTotal = priorWeek.attention + priorWeek.review + priorWeek.ready;
  const change = activeTotal - priorTotal;
  const totalPoints = createFlowChartPoints((week) => week.attention + week.review + week.ready);
  const attentionPoints = createFlowChartPoints((week) => week.attention);
  const totalPath = createSmoothPath(totalPoints);
  const attentionPath = createSmoothPath(attentionPoints);
  const momentumPoints = createMomentumChartPoints();
  const momentumPath = createSmoothPath(momentumPoints);
  const selectedTotalPoint = totalPoints[activeIndex] ?? totalPoints[currentIndex];
  const selectedAttentionPoint = attentionPoints[activeIndex] ?? attentionPoints[currentIndex];
  const selectedMomentumPoint = momentumPoints[activeIndex] ?? momentumPoints[currentIndex];
  const totalAreaPath = selectedTotalPoint && totalPoints[0]
    ? `${totalPath} L ${totalPoints[totalPoints.length - 1]?.x ?? flowChartGeometry.width} ${flowChartGeometry.baseline} L ${totalPoints[0].x} ${flowChartGeometry.baseline} Z`
    : "";
  const momentumAreaPath = selectedMomentumPoint && momentumPoints[0]
    ? `${momentumPath} L ${momentumPoints[momentumPoints.length - 1]?.x ?? momentumChartGeometry.width} ${momentumChartGeometry.baseline} L ${momentumPoints[0].x} ${momentumChartGeometry.baseline} Z`
    : "";

  return (
    <div className={styles.flowVisual}>
      <div className={styles.flowSummary} aria-live="polite">
        <div><strong>{activeTotal}</strong><span>active reviews</span></div>
        <span className={styles.flowChange} data-tone={change > 0 ? "up" : change < 0 ? "down" : "flat"}>
          {change !== 0 && <Icon name={change > 0 ? "trendUp" : "trendDown"} size="sm" />}
          {activeIndex === 0 ? "Opening week" : `${change > 0 ? "+" : ""}${change} vs prior week`}
        </span>
      </div>

      <div className={styles.flowChartHeader}>
        <span>{variant === "refined" ? "Active workload · 6 weeks" : variant === "trend" ? "Portfolio momentum · 6 weeks" : "Active review mix · 6 weeks"}</span>
        <strong>{selectedWeek.label}</strong>
      </div>

      {variant === "refined" ? (
        <>
          <div className={styles.momentumPlot} onMouseLeave={() => setActiveIndex(currentIndex)}>
            <div className={styles.momentumCanvas}>
              <svg viewBox={`0 0 ${momentumChartGeometry.width} 132`} preserveAspectRatio="none" role="img" aria-label="Active workload momentum">
                <title>Active workload momentum</title>
                <desc>Six weeks of active reviews, ranging from 52 to 61. Inspecting a week updates the total and the workflow mix beneath the chart.</desc>
                <line className={styles.momentumBaseline} x1="0" x2={momentumChartGeometry.width} y1={momentumChartGeometry.baseline} y2={momentumChartGeometry.baseline} vectorEffect="non-scaling-stroke" />
                <path className={styles.momentumArea} d={momentumAreaPath} />
                <path className={styles.momentumLine} d={momentumPath} vectorEffect="non-scaling-stroke" />
                {selectedMomentumPoint && <line className={styles.momentumGuide} x1={selectedMomentumPoint.x} x2={selectedMomentumPoint.x} y1={momentumChartGeometry.top} y2={momentumChartGeometry.baseline} vectorEffect="non-scaling-stroke" />}
                {selectedMomentumPoint && <circle className={styles.momentumPoint} cx={selectedMomentumPoint.x} cy={selectedMomentumPoint.y} r="4" vectorEffect="non-scaling-stroke" />}
              </svg>
              <div className={styles.momentumTargets}>
                {portfolioFlow.map((week, index) => {
                  const total = week.attention + week.review + week.ready;
                  return (
                    <button
                      type="button"
                      key={week.label}
                      aria-label={`${week.label}: ${total} active reviews, ${week.attention} need attention, ${week.review} in review, ${week.ready} ready for decision`}
                      aria-pressed={activeIndex === index}
                      onClick={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                    />
                  );
                })}
              </div>
            </div>
            <div className={styles.momentumLabels} aria-hidden="true">
              {portfolioFlow.map((week, index) => <span key={week.label} data-active={activeIndex === index}>{week.label.replace(" ", "\u00a0")}</span>)}
            </div>
          </div>
          <section className={styles.momentumMix} aria-label={`Workflow mix for ${selectedWeek.label}`}>
            <div className={styles.momentumMixBar} role="img" aria-label={`${selectedWeek.attention} need attention, ${selectedWeek.review} in review, ${selectedWeek.ready} ready for decision`}>
              <span data-tone="attention" style={{ flexBasis: `${(selectedWeek.attention / activeTotal) * 100}%` }} />
              <span data-tone="review" style={{ flexBasis: `${(selectedWeek.review / activeTotal) * 100}%` }} />
              <span data-tone="ready" style={{ flexBasis: `${(selectedWeek.ready / activeTotal) * 100}%` }} />
            </div>
            <div className={styles.momentumMixLegend}>
              <span><span><i data-tone="attention" />Attention</span><strong>{selectedWeek.attention}</strong></span>
              <span><span><i data-tone="review" />In review</span><strong>{selectedWeek.review}</strong></span>
              <span><span aria-label="Decision-ready"><i data-tone="ready" />Ready</span><strong>{selectedWeek.ready}</strong></span>
            </div>
          </section>
        </>
      ) : variant === "trend" ? (
        <>
          <div className={styles.flowTrendPlot} onMouseLeave={() => setActiveIndex(currentIndex)}>
            <div className={styles.flowTrendScale} aria-hidden="true"><span>60</span><span>40</span><span>20</span><span>0</span></div>
            <div className={styles.flowTrendCanvas}>
              <svg viewBox={`0 0 ${flowChartGeometry.width} 132`} preserveAspectRatio="none" role="img" aria-label="Active review and attention trend">
                <title id="portfolio-flow-chart-title">Active review and attention trend</title>
                <desc id="portfolio-flow-chart-description">Six weeks of active portfolio reviews with a secondary line for reviews needing attention. Inspecting a week updates the values above and below the chart.</desc>
                {[0, 1, 2, 3].map((line) => {
                  const y = flowChartGeometry.top + (((flowChartGeometry.baseline - flowChartGeometry.top) / 3) * line);
                  return <line className={styles.flowTrendGridLine} key={line} x1="0" x2={flowChartGeometry.width} y1={y} y2={y} vectorEffect="non-scaling-stroke" />;
                })}
                <path className={styles.flowTrendArea} d={totalAreaPath} />
                <path className={styles.flowTrendTotalLine} d={totalPath} vectorEffect="non-scaling-stroke" />
                <path className={styles.flowTrendAttentionLine} d={attentionPath} vectorEffect="non-scaling-stroke" />
                {selectedTotalPoint && <line className={styles.flowTrendGuide} x1={selectedTotalPoint.x} x2={selectedTotalPoint.x} y1={flowChartGeometry.top} y2={flowChartGeometry.baseline} vectorEffect="non-scaling-stroke" />}
                {selectedTotalPoint && <circle className={styles.flowTrendTotalPoint} cx={selectedTotalPoint.x} cy={selectedTotalPoint.y} r="4" vectorEffect="non-scaling-stroke" />}
                {selectedAttentionPoint && <circle className={styles.flowTrendAttentionPoint} cx={selectedAttentionPoint.x} cy={selectedAttentionPoint.y} r="3.5" vectorEffect="non-scaling-stroke" />}
              </svg>
              <div className={styles.flowTrendTargets}>
                {portfolioFlow.map((week, index) => {
                  const total = week.attention + week.review + week.ready;
                  return (
                    <button
                      type="button"
                      key={week.label}
                      aria-label={`${week.label}: ${total} active reviews, ${week.attention} need attention, ${week.review} in review, ${week.ready} ready for decision`}
                      aria-pressed={activeIndex === index}
                      onClick={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                    />
                  );
                })}
              </div>
            </div>
            <div className={styles.flowTrendLabels} aria-hidden="true">
              {portfolioFlow.map((week, index) => <span key={week.label} data-active={activeIndex === index}>{week.label.replace(" ", "\u00a0")}</span>)}
            </div>
          </div>
          <div className={`${styles.flowLegend} ${styles.flowTrendLegend}`} aria-label={`Trend and workflow mix for ${selectedWeek.label}`}>
            <span><i data-tone="total" />Active reviews <strong>{activeTotal}</strong></span>
            <span><i data-tone="attention" />Needs attention <strong>{selectedWeek.attention}</strong></span>
            <span className={styles.flowTrendContext}>{selectedWeek.review} in review · {selectedWeek.ready} decision-ready</span>
          </div>
        </>
      ) : (
        <>
          <div className={styles.flowPlot} onMouseLeave={() => setActiveIndex(currentIndex)}>
            <div className={styles.flowScale} aria-hidden="true"><span>60</span><span>40</span><span>20</span><span>0</span></div>
            <div className={styles.flowBars}>
              {portfolioFlow.map((week, index) => {
                const total = week.attention + week.review + week.ready;
                return (
                  <button
                    type="button"
                    key={week.label}
                    aria-label={`${week.label}: ${total} active reviews, ${week.attention} need attention, ${week.review} in review, ${week.ready} ready for decision`}
                    aria-pressed={activeIndex === index}
                    onClick={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className={styles.flowBar} style={{ height: `${(total / 65) * 100}%` }} aria-hidden="true">
                      <span data-tone="attention" style={{ flexGrow: week.attention }} />
                      <span data-tone="review" style={{ flexGrow: week.review }} />
                      <span data-tone="ready" style={{ flexGrow: week.ready }} />
                    </span>
                    <small>{week.label.replace(" ", "\u00a0")}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.flowLegend} aria-label={`Breakdown for ${selectedWeek.label}`}>
            <span><i data-tone="attention" />Needs attention <strong>{selectedWeek.attention}</strong></span>
            <span><i data-tone="review" />In review <strong>{selectedWeek.review}</strong></span>
            <span><i data-tone="ready" />Decision-ready <strong>{selectedWeek.ready}</strong></span>
          </div>
        </>
      )}
    </div>
  );
}

function BalancedStatusDashboard({
  myReviews,
  awaitingDecision,
  operationalCards,
}: {
  myReviews: CreditReview[];
  awaitingDecision: CreditReview[];
  operationalCards: Array<{ label: string; value: number; description: string; icon: IconName; tone: string; search: string }>;
}) {
  return (
    <>
      <section className={styles.primaryGrid} aria-label="Review portfolio summary">
        <Panel className={styles.portfolioCard}>
          <div className={styles.cardHeader}>
            <div><span>Portfolio review status</span><strong>68 reviews</strong></div>
            <AppLink to="/credit-reviews">View all</AppLink>
          </div>
          <div className={styles.portfolioVisual} aria-label="68 reviews by workflow status">
            <div className={styles.portfolioNumber}><strong>61</strong><span>currently active</span></div>
            <div className={styles.stackedBar} aria-hidden="true">
              {portfolioStatuses.map((status) => <span key={status.label} data-tone={status.tone} style={{ flexGrow: status.count }} />)}
            </div>
            <div className={styles.portfolioLegend}>
              {portfolioStatuses.map((status) => (
                <div key={status.label}><span data-tone={status.tone} aria-hidden="true" /><small>{status.label}</small><strong>{status.count}</strong></div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className={styles.workloadCard}>
          <div className={styles.cardHeader}>
            <div><span>My workload</span><strong>{myReviews.length} assigned reviews</strong></div>
            <AppLink to="/credit-reviews">Open queue</AppLink>
          </div>
          <div className={styles.workloadMetrics}>
            <WorkloadMetric value={myReviews.filter((review) => review.status === "needs-attention").length} label="Need attention" detail="Your next actions" />
            <WorkloadMetric value={myReviews.filter((review) => review.dueGroup === "urgent").length} label="Due in 48 hours" detail="Meridian and Northstar" tone="warning" />
            <WorkloadMetric value={awaitingDecision.length} label="Awaiting decision" detail="Recommendations ready" />
          </div>
          <div className={styles.workloadFooter}><span><Icon name="clock" size="sm" /> Next due</span><strong>Meridian Foods · Today</strong></div>
        </Panel>
      </section>

      <section className={styles.operationalGrid} aria-label="Operational priorities">
        {operationalCards.map((card) => (
          <AppLink className={styles.operationalCard} to="/credit-reviews" search={card.search} key={card.label}>
            <span className={styles.operationalIcon} data-tone={card.tone}><Icon name={card.icon} size="sm" /></span>
            <span className={styles.operationalCopy}><small>{card.label}</small><strong>{card.value}</strong><span>{card.description}</span></span>
            <Icon className={styles.operationalArrow} name="arrowRight" size="sm" />
          </AppLink>
        ))}
      </section>
    </>
  );
}

function WorkloadMetric({ value, label, detail, tone = "neutral" }: { value: number; label: string; detail: string; tone?: "neutral" | "warning" }) {
  return (
    <div className={styles.workloadMetric} data-tone={tone}>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  );
}
