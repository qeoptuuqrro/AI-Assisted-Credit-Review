import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import type { BorrowerContact } from "./borrowerContacts";
import styles from "./BorrowerContactSelector.module.css";

type BorrowerContactSelectorProps = {
  contacts: BorrowerContact[];
  selectedId: string;
  onSelect: (id: string) => void;
  name: string;
  legend?: string;
};

export function BorrowerContactSelector({ contacts, selectedId, onSelect, name, legend = "Borrower contact" }: BorrowerContactSelectorProps) {
  return (
    <fieldset className={styles.selector}>
      <legend>{legend}</legend>
      {contacts.map((contact) => (
        <label key={contact.id} data-selected={contact.id === selectedId}>
          <input type="radio" name={name} value={contact.id} checked={contact.id === selectedId} onChange={() => onSelect(contact.id)} />
          <span className={styles.avatar} aria-hidden="true">{contact.initials}</span>
          <span className={styles.copy}><strong>{contact.name}</strong><small>{contact.role} · {contact.email}</small></span>
          {contact.primary && <StatusPill tone="neutral">Primary contact</StatusPill>}
        </label>
      ))}
    </fieldset>
  );
}
