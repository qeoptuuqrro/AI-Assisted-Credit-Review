import type { ReactNode } from "react";
import { Icon, type IconName } from "../../../shared/ui/Icon/Icon";
import { IconTile, type IconTone } from "../../../shared/ui/IconTile/IconTile";
import type { StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import styles from "./CreditFindingsWorkspace.module.css";

export type CreditFindingRisk = "material" | "moderate" | "low";

export type CreditFindingListItem = {
  id: string;
  title: string;
  summary: string;
  icon: IconName;
  risk: {
    label: string;
    level: CreditFindingRisk;
  };
  status: {
    label: string;
    tone: StatusPillTone;
  };
};

export type CreditFindingGroup = {
  title: string;
  items: CreditFindingListItem[];
};

type CreditFindingsWorkspaceProps = {
  groups: CreditFindingGroup[];
  selectedId: string;
  onSelect: (id: string) => void;
  previewLabel: string;
  children: ReactNode;
};

export function CreditFindingsWorkspace({ groups, selectedId, onSelect, previewLabel, children }: CreditFindingsWorkspaceProps) {
  return (
    <div className={styles.workspace}>
      <div className={styles.master}>
        {groups.map((group) => (
          <section className={styles.group} role="region" aria-label={group.title} key={group.title}>
            <header><h2>{group.title}</h2><span>{group.items.length}</span></header>
            <div className={styles.list}>
              {group.items.map((item) => (
                <button
                  type="button"
                  className={styles.row}
                  aria-pressed={selectedId === item.id}
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                >
                  <IconTile size="sm"><Icon name={item.icon} size="sm" /></IconTile>
                  <span className={styles.copy}>
                    <strong>{item.title}</strong>
                    <span>{item.summary}</span>
                    <small>
                      <span className={styles.risk} data-risk={item.risk.level}>{item.risk.label}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.status.label}</span>
                    </small>
                  </span>
                  <Icon name="chevronRight" size="sm" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <aside className={styles.preview} aria-label={previewLabel}>{children}</aside>
    </div>
  );
}

type CreditFindingsStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconName;
  iconTone: IconTone;
  status: ReactNode;
  facts: Array<{ label: string; value: string }>;
  action: ReactNode;
};

export function CreditFindingsState({ eyebrow, title, description, icon, iconTone, status, facts, action }: CreditFindingsStateProps) {
  return (
    <section className={styles.state} aria-labelledby="credit-findings-state-title">
      <header>
        <span>{eyebrow}</span>
        {status}
      </header>
      <div className={styles.stateBody}>
        <div className={styles.stateMessage}>
          <IconTile tone={iconTone}><Icon name={icon} /></IconTile>
          <div>
            <h3 id="credit-findings-state-title">{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        <dl className={styles.stateFacts}>
          {facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
        </dl>
      </div>
      <footer>{action}</footer>
    </section>
  );
}
