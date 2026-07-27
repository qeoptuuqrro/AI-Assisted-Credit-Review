import { useMemo, useState } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { MetricCard } from "../../../shared/ui/MetricCard/MetricCard";
import { Panel } from "../../../shared/ui/Panel/Panel";
import { ScenarioComparison } from "../../../shared/ui/ScenarioComparison/ScenarioComparison";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { financialSeries, type FinancialMetric, type FindingId } from "./meridianData";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import styles from "./MeridianReviewWorkspace.module.css";

type FinancialsTabProps = {
  onOpenFinding: (id: FindingId) => void;
  variant?: "treasury" | "card-grid";
  learningMode?: boolean;
};

const metricOrder: FinancialMetric[] = ["margin", "leverage", "coverage"];

export function FinancialsTab({ onOpenFinding, variant = "treasury", learningMode = false }: FinancialsTabProps) {
  const learn = (topicId: "financials-story" | "financials-metrics" | "financials-trend" | "financials-scenarios" | "financials-drivers") => getLearningTargetProps(learningMode, topicId);
  const [metric, setMetric] = useState<FinancialMetric>("margin");
  const [range, setRange] = useState<"actual" | "forecast">("forecast");
  const current = financialSeries[metric];
  const points = range === "actual" ? current.points.slice(0, 7) : current.points;
  const labels = range === "actual" ? current.labels.slice(0, 7) : current.labels;
  const threshold = metric === "leverage"
    ? { value: 4.25, label: "4.25x proposed maximum" }
    : metric === "coverage"
      ? { value: 1.2, label: "1.20x proposed minimum" }
      : undefined;

  return (
    <div className={styles.tabStack}>
      <div {...learn("financials-story")}><SectionHeader title="Financial assessment" description="Each view answers a repayment or covenant question; forecast periods are distinguished from reported actuals." actions={
        <div className={styles.segmentedControl} role="group" aria-label="Financial period">
          <button type="button" className={range === "actual" ? styles.segmentActive : ""} aria-pressed={range === "actual"} onClick={() => setRange("actual")}>Actual</button>
          <button type="button" className={range === "forecast" ? styles.segmentActive : ""} aria-pressed={range === "forecast"} onClick={() => setRange("forecast")}>Actual + forecast</button>
        </div>
      } /></div>

      <div className={styles.financialMetricStrip} {...learn("financials-metrics")}>
        {metricOrder.map((id) => {
          const item = financialSeries[id];
          return (
            <MetricCard
              key={id}
              className={variant === "treasury" ? styles.financialMetricCard : ""}
              label={item.label}
              value={item.value}
              detail={<><Icon name={item.direction === "up" ? "trendUp" : "trendDown"} size="xs" /> {item.change}</>}
              density={variant === "treasury" ? "compact" : "default"}
              elevation={variant === "treasury" ? "flat" : "raised"}
              selected={metric === id}
              onClick={() => setMetric(id)}
            />
          );
        })}
      </div>

      <div {...learn("financials-trend")}><Panel className={styles.chartSection} aria-labelledby="financial-chart-title">
        <div className={styles.chartNarrative}>
          <span>Credit interpretation</span>
          <h2 id="financial-chart-title">{current.insight}</h2>
          <p>Source: Q2 2026 Financials and management forecast · Reviewed Jul 24, 2026</p>
          <Button size="sm" variant="quiet" icon={<Icon name="arrowRight" size="xs" />} onClick={() => onOpenFinding(metric === "margin" ? "declining-margins" : "increasing-leverage")}>Review related finding</Button>
        </div>
        <TrendChart points={points} labels={labels} suffix={metric === "margin" ? "%" : "x"} forecastStart={range === "forecast" ? 6 : null} threshold={threshold} />
      </Panel></div>

      {variant === "card-grid" ? (
        <div className={styles.financialDetailGrid}>
          <div {...learn("financials-scenarios")}><Panel className={styles.financialDetailCard}>
            <SectionHeader title="Repayment capacity" description="Coverage compared with the proposed 1.20x minimum." />
            <div className={styles.repaymentMetricGrid}>
              <MetricCard label="Base case" value="1.41x" detail="0.21x headroom" detailTone="positive" density="compact" elevation="flat" />
              <MetricCard label="Downside case" value="1.12x" detail="0.08x below floor" detailTone="negative" density="compact" elevation="flat" />
              <MetricCard label="Covenant floor" value="1.20x" detail="Proposed minimum" density="compact" elevation="flat" />
            </div>
            <p className={styles.repaymentInterpretation}><Icon name="alertCircle" size="sm" /> The base case clears policy; the downside breaches the proposed floor and requires monitoring conditions.</p>
          </Panel></div>
          <div {...learn("financials-drivers")}><Panel className={styles.financialDetailCard}>
            <SectionHeader title="Primary drivers" description="The assumptions with the greatest effect on the credit conclusion." />
            <div className={styles.driverGrid}>
              <div><span>Pricing realization</span><strong>Moderate sensitivity</strong><small>50% of margin recovery</small></div>
              <div><span>Commodity costs</span><strong>High sensitivity</strong><small>Largest downside variable</small></div>
              <div><span>Customer retention</span><strong>High sensitivity</strong><small>61% in top two accounts</small></div>
              <div><span>Initial facility draw</span><strong>65% assumed</strong><small>$11.7M at close</small></div>
            </div>
          </Panel></div>
        </div>
      ) : (
        <section className={styles.financialDecisionSection} aria-label="Repayment and primary drivers">
          <div className={styles.repaymentWorkspace} {...learn("financials-scenarios")}>
            <SectionHeader eyebrow="Covenant view" title="Repayment capacity" description="Coverage compared directly with the proposed 1.20x minimum." />
            <ScenarioComparison
              items={[
                { label: "Base case", value: "1.41x", variance: "+0.21x above", outcome: "Clears", tone: "positive" },
                { label: "Downside case", value: "1.12x", variance: "−0.08x below", outcome: "Breaches", tone: "negative" },
              ]}
              thresholdLabel="Covenant floor"
              thresholdValue="1.20x"
            />
            <p className={styles.repaymentInterpretation}><Icon name="alertCircle" size="sm" /> The downside breach—not the base case—is the reason monitoring conditions remain part of the recommendation.</p>
          </div>

          <div className={styles.primaryDriverWorkspace} {...learn("financials-drivers")}>
            <SectionHeader eyebrow="Sensitivity" title="Primary drivers" description="The assumptions with the greatest effect on the credit conclusion." />
            <div className={styles.driverList}>
              <div><IconTile size="sm"><Icon name="trendUp" size="sm" /></IconTile><span><strong>Pricing realization</strong><small>50% of margin recovery</small></span><em>Moderate</em></div>
              <div><IconTile size="sm" tone="warning"><Icon name="chart" size="sm" /></IconTile><span><strong>Commodity costs</strong><small>Largest downside variable</small></span><em>High</em></div>
              <div><IconTile size="sm" tone="warning"><Icon name="users" size="sm" /></IconTile><span><strong>Customer retention</strong><small>61% in top two accounts</small></span><em>High</em></div>
              <div><IconTile size="sm"><Icon name="calculator" size="sm" /></IconTile><span><strong>Initial facility draw</strong><small>$11.7M at close</small></span><em>65%</em></div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function TrendChart({ points, labels, suffix, forecastStart, threshold }: { points: number[]; labels: string[]; suffix: string; forecastStart: number | null; threshold?: { value: number; label: string } }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chart = useMemo(() => {
    const domain = threshold ? [...points, threshold.value] : points;
    const min = Math.min(...domain) * 0.9;
    const max = Math.max(...domain) * 1.06;
    const width = 720;
    const height = 220;
    const xStep = width / Math.max(points.length - 1, 1);
    const coordinates = points.map((value, index) => ({ x: index * xStep, y: height - ((value - min) / (max - min)) * height, value }));
    const line = coordinates.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
    const area = `${line} L${width},${height} L0,${height} Z`;
    return { width, height, coordinates, line, area, min, max };
  }, [points, threshold]);
  const defaultIndex = forecastStart ?? chart.coordinates.length - 1;
  const activeIndex = hoveredIndex ?? defaultIndex;
  const active = chart.coordinates[activeIndex];
  const activeLabel = labels[activeIndex];

  return (
    <div className={styles.chartWrap} onMouseLeave={() => setHoveredIndex(null)}>
      <div className={styles.chartValue} aria-live="polite"><strong>{active?.value.toFixed(2)}{suffix}</strong><span>{activeLabel}</span></div>
      <svg className={styles.trendChart} viewBox={`-42 -18 ${chart.width + 66} ${chart.height + 64}`} role="img" aria-label={`Trend from ${labels[0]} to ${labels.at(-1)}`}>
        {[0, 0.33, 0.66, 1].map((ratio) => {
          const y = chart.height * ratio;
          const value = chart.max - (chart.max - chart.min) * ratio;
          return <g key={ratio}><line x1="0" y1={y} x2={chart.width} y2={y} className={styles.chartGrid} /><text x="-10" y={y + 4} textAnchor="end">{value.toFixed(1)}{suffix}</text></g>;
        })}
        {forecastStart !== null && chart.coordinates[forecastStart] && <rect x={chart.coordinates[forecastStart].x} y="0" width={chart.width - chart.coordinates[forecastStart].x} height={chart.height} className={styles.forecastArea} />}
        <path d={chart.area} className={styles.chartArea} />
        <path d={chart.line} className={styles.chartLine} />
        {threshold && (() => {
          const y = chart.height - ((threshold.value - chart.min) / (chart.max - chart.min)) * chart.height;
          return <><line x1="0" y1={y} x2={chart.width} y2={y} className={styles.chartThreshold} /><text x={chart.width - 4} y={y - 6} textAnchor="end" className={styles.chartThresholdLabel}>{threshold.label}</text></>;
        })()}
        {chart.coordinates.map((point, index) => (
          <g key={`${point.x}-${point.y}`} onMouseEnter={() => setHoveredIndex(index)}>
            <rect x={point.x - 18} y="0" width="36" height={chart.height} fill="transparent" />
            {activeIndex === index && <><line x1={point.x} y1="0" x2={point.x} y2={chart.height} className={styles.chartGuide} /><circle cx={point.x} cy={point.y} r="4" className={styles.chartDot} /></>}
          </g>
        ))}
        {labels.map((label, index) => (index % Math.max(1, Math.floor(labels.length / 5)) === 0 || index === labels.length - 1) && <text key={label} x={chart.coordinates[index].x} y={chart.height + 30} textAnchor={index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle"}>{label}</text>)}
        {forecastStart !== null && chart.coordinates[forecastStart] && <text x={chart.coordinates[forecastStart].x + 8} y="16" className={styles.forecastLabel}>FORECAST</text>}
      </svg>
    </div>
  );
}
