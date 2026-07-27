import { Badge } from "../../shared/ui/Badge/Badge";
import { Button } from "../../shared/ui/Button/Button";
import { Panel } from "../../shared/ui/Panel/Panel";
import styles from "./FoundationsPage.module.css";

const colorRoles = [
  ["Canvas", "var(--color-canvas)"],
  ["Surface", "var(--color-surface)"],
  ["Ink", "var(--color-ink)"],
  ["Accent", "var(--color-accent)"],
] as const;

export function FoundationsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p>Design system</p>
        <h1>Foundations</h1>
        <span>Tokens express product decisions. Components consume tokens through explicit contracts.</span>
      </header>

      <section>
        <h2>Semantic colors</h2>
        <div className={styles.colorGrid}>
          {colorRoles.map(([label, color]) => (
            <Panel className={styles.colorCard} key={label}>
              <span className={styles.swatch} style={{ background: color }} />
              <strong>{label}</strong>
              <code>{color.replace("var(", "").replace(")", "")}</code>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <h2>Button contract</h2>
        <Panel className={styles.componentRow}>
          <Button variant="primary">Primary action</Button>
          <Button>Secondary</Button>
          <Button variant="quiet">Quiet</Button>
          <Button disabled>Disabled</Button>
        </Panel>
      </section>

      <section>
        <h2>Status contract</h2>
        <Panel className={styles.componentRow}>
          <Badge>Neutral</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
        </Panel>
      </section>
    </div>
  );
}
