import { useId, useMemo, useState } from "react";
import styles from "./CoverageChart.module.css";

type SeriesKey = "actual" | "base" | "downside";

const quarters = ["Q4 ’25", "Q1 ’26", "Q2 ’26", "Q3 ’26"];
const series: Record<SeriesKey, { label: string; values: Array<number | null> }> = {
  actual: { label: "Actual", values: [1.58, 1.44, null, null] },
  base: { label: "Base case", values: [null, 1.44, 1.39, 1.34] },
  downside: { label: "Downside", values: [null, 1.44, 1.16, 1.08] },
};

const chartWidth = 640;
const chartHeight = 250;
const plot = { left: 52, right: 616, top: 24, bottom: 204 };
const yMin = 0.8;
const yMax = 1.8;
const yTicks = [0.8, 1, 1.25, 1.5, 1.75];
const covenant = 1.25;

function xFor(index: number) {
  return plot.left + (index * (plot.right - plot.left)) / (quarters.length - 1);
}

function yFor(value: number) {
  return plot.bottom - ((value - yMin) / (yMax - yMin)) * (plot.bottom - plot.top);
}

function pathFor(values: Array<number | null>) {
  return values.reduce<string>((path, value, index) => {
    if (value === null) return path;
    const command = index === 0 || values[index - 1] === null ? "M" : "L";
    return `${path}${command}${xFor(index)} ${yFor(value)} `;
  }, "");
}

export function CoverageChart() {
  const titleId = useId();
  const descriptionId = useId();
  const [selectedQuarter, setSelectedQuarter] = useState(2);

  const selectedValues = useMemo(() => ({
    base: series.base.values[selectedQuarter],
    downside: series.downside.values[selectedQuarter],
  }), [selectedQuarter]);

  return (
    <figure className={styles.figure} aria-labelledby={titleId} aria-describedby={descriptionId}>
      <figcaption className={styles.header}>
        <div>
          <h3 id={titleId}>Fixed-charge coverage</h3>
          <p id={descriptionId}>Actual and projected coverage against the 1.25× covenant.</p>
        </div>
        <div className={styles.legend} aria-label="Chart legend">
          {(Object.keys(series) as SeriesKey[]).map((key) => (
            <span key={key} className={styles.legendItem}>
              <span className={`${styles.legendMark} ${styles[key]}`} aria-hidden="true" />
              {series[key].label}
            </span>
          ))}
          <span className={styles.legendItem}>
            <span className={`${styles.legendMark} ${styles.covenant}`} aria-hidden="true" />
            Covenant
          </span>
        </div>
      </figcaption>

      <div className={styles.plotWrap}>
        <svg className={styles.chart} viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img">
          {yTicks.map((tick) => (
            <g key={tick}>
              <line className={styles.gridLine} x1={plot.left} x2={plot.right} y1={yFor(tick)} y2={yFor(tick)} />
              <text className={styles.axisLabel} x={plot.left - 12} y={yFor(tick) + 4} textAnchor="end">{tick.toFixed(tick === 1 ? 1 : 2)}×</text>
            </g>
          ))}

          <line className={styles.covenantLine} x1={plot.left} x2={plot.right} y1={yFor(covenant)} y2={yFor(covenant)} />

          {(Object.keys(series) as SeriesKey[]).map((key) => (
            <path key={key} className={`${styles.seriesLine} ${styles[`${key}Line`]}`} d={pathFor(series[key].values)} />
          ))}

          {quarters.map((quarter, index) => (
            <g key={quarter}>
              {selectedQuarter === index && <line className={styles.selectedGuide} x1={xFor(index)} x2={xFor(index)} y1={plot.top} y2={plot.bottom} />}
              <text className={styles.quarterLabel} x={xFor(index)} y={plot.bottom + 30} textAnchor="middle">{quarter}</text>
              {series.base.values[index] !== null && (
                <circle
                  className={`${styles.point} ${styles.basePoint}`}
                  cx={xFor(index)}
                  cy={yFor(series.base.values[index] as number)}
                  r="5"
                  tabIndex={0}
                  role="button"
                  aria-label={`${quarter}: base case ${(series.base.values[index] as number).toFixed(2)} times`}
                  onClick={() => setSelectedQuarter(index)}
                  onFocus={() => setSelectedQuarter(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedQuarter(index);
                    }
                  }}
                  onMouseEnter={() => setSelectedQuarter(index)}
                />
              )}
              {series.downside.values[index] !== null && (
                <circle
                  className={`${styles.point} ${styles.downsidePoint}`}
                  cx={xFor(index)}
                  cy={yFor(series.downside.values[index] as number)}
                  r="5"
                  tabIndex={0}
                  role="button"
                  aria-label={`${quarter}: downside ${(series.downside.values[index] as number).toFixed(2)} times`}
                  onClick={() => setSelectedQuarter(index)}
                  onFocus={() => setSelectedQuarter(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedQuarter(index);
                    }
                  }}
                  onMouseEnter={() => setSelectedQuarter(index)}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className={styles.readout} aria-live="polite">
        <span><strong>{quarters[selectedQuarter]}</strong> selected</span>
        <span>Base <strong>{selectedValues.base?.toFixed(2)}×</strong></span>
        <span>Downside <strong>{selectedValues.downside?.toFixed(2)}×</strong></span>
        <span className={selectedValues.downside !== null && selectedValues.downside < covenant ? styles.below : styles.above}>
          {selectedValues.downside !== null && selectedValues.downside < covenant
            ? `${(covenant - selectedValues.downside).toFixed(2)}× below covenant`
            : "Above covenant"}
        </span>
      </div>
    </figure>
  );
}
